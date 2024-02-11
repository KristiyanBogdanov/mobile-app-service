import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ClientSession, Document } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { HwApi } from '../shared/api';
import { LOCATION_NAME_MAX_LENGTH, LOCATION_NAME_MIN_LENGTH } from '../shared/constants';
import { User } from '../user/schema';
import { BriefUserInfo } from '../user/dto';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationType } from '../firebase/enum';
import { LocationRepository } from './repository';
import { Location } from './schema';
import {
    GetLocationLimitsRes, AddLocationReq, LocationDto,
    ValidateSTSerialNumberHwApiRes, ValidateWSSerialNumberHwApiRes, ValidateSTSerialNumberRes, ValidateWSSerialNumberRes,
    GetLocationInsightsRes, SolarTrackersInsightsHwApiRes, WeatherStationInsightsHwApiRes, WeatherStationInsightsDto, SolarTrackerInsightsDto,
    SolarTrackerDto
} from './dto';

@Injectable()
export class LocationService {
    constructor(
        private readonly locationRepository: LocationRepository,
        private readonly hwApi: HwApi,
        private readonly httpService: HttpService,
        private readonly firebaseService: FirebaseService
    ) { }

    getLimits(): GetLocationLimitsRes {
        return {
            nameMinLength: LOCATION_NAME_MIN_LENGTH,
            nameMaxLength: LOCATION_NAME_MAX_LENGTH,
        };
    }

    async mapToLocationDto(userId: string, location: Location & Document): Promise<LocationDto> {
        await location.populate('sharedWith');

        const sharedWithFiltered = location.sharedWith.filter((user) => user.id !== userId);

        const locationDto = plainToClass(LocationDto, location);
        locationDto.solarTrackers = location.solarTrackers.map((st) => plainToClass(SolarTrackerDto, st));
        locationDto.sharedWith = sharedWithFiltered.map((user) => plainToClass(BriefUserInfo, user));
        locationDto.amIOwner = location.owner === userId;

        return locationDto;
    }

    async getLocation(userId: string, locationId: string): Promise<LocationDto> {
        const location = await this.locationRepository.findById(locationId);

        if (!location) {
            throw new NotFoundException();
        }

        return await this.mapToLocationDto(userId, location);
    }

    async validateSTSerialNumber(userId: string, serialNumber: string, session?: ClientSession): Promise<ValidateSTSerialNumberRes> {
        const response = await lastValueFrom(
            this.httpService.get<ValidateSTSerialNumberHwApiRes>(this.hwApi.validateSTSerialNumber(serialNumber))
        ).then((response) => response.data);

        if (!response.isValid) {
            return { isValid: false };
        }

        const location = await this.locationRepository.findOne({ solarTrackers: { $elemMatch: { serialNumber } } }, {}, { session });

        if (location) {
            const isAdded = location.sharedWith.some((user) => user.id === userId);
            return { isValid: true, isUsed: true, isAdded };
        }

        return {
            isValid: true,
            isUsed: false,
            solarTracker: { serialNumber, capacity: response.capacity }
        };
    }

    async validateWSSerialNumber(serialNumber: string): Promise<ValidateWSSerialNumberRes> {
        const isValid = await lastValueFrom(
            this.httpService.get<ValidateWSSerialNumberHwApiRes>(this.hwApi.validateWSSerialNumber(serialNumber))
        ).then((response) => response.data.isValid);

        return { isValid };
    }

    private async validateSTCanBeAdd(userId: string, serialNumber: string, session?: ClientSession): Promise<SolarTrackerDto> {
        const result = await this.validateSTSerialNumber(userId, serialNumber, session);

        if (!result.isValid) {
            throw new BadRequestException();
        }

        if (result.isUsed) {
            throw new ConflictException();
        }

        return result.solarTracker;
    }

    private async validateWSCanBeAdd(serialNumber: string): Promise<void> {
        const result = await this.validateWSSerialNumber(serialNumber);

        if (!result.isValid) {
            throw new BadRequestException();
        }
    }

    async addNew(user: User, locationData: AddLocationReq, session: ClientSession): Promise<Location> {
        const [solarTrackers] = await Promise.all([
            Promise.all(
                locationData.solarTrackerSerialNumbers.map((serialNumber) => this.validateSTCanBeAdd(user.id, serialNumber, session))
            ),
            locationData.weatherStation ? this.validateWSCanBeAdd(locationData.weatherStation) : Promise.resolve(),
        ]);

        const location = plainToClass(Location, locationData);
        location.owner = user.id;
        location.solarTrackers = solarTrackers;
        location.sharedWith = [user];

        return await this.locationRepository.createInSession(location, session);
    }

    private async getSolarTrackersInsightsHwApiRes(serialNumbers: string[]): Promise<SolarTrackersInsightsHwApiRes> {
        return lastValueFrom(
            this.httpService.post<SolarTrackersInsightsHwApiRes>(this.hwApi.getSTInsights(), { serialNumbers })
        ).then((response) => response.data);
    }

    private async getWeatherStationInsightsHwApiRes(wsSerialNumber: string): Promise<WeatherStationInsightsHwApiRes> {
        return lastValueFrom(
            this.httpService.get<WeatherStationInsightsHwApiRes>(this.hwApi.getWSInsights(wsSerialNumber))
        ).then((response) => response.data);
    }

    async getInsights(locationId: string): Promise<GetLocationInsightsRes> {
        const location = await this.locationRepository.findById(locationId);

        if (!location) {
            throw new NotFoundException();
        }

        const [stInsights, wsInsights] = await Promise.all([
            this.getSolarTrackersInsightsHwApiRes(location.solarTrackers.map((st) => st.serialNumber)),
            location.weatherStation
                ? this.getWeatherStationInsightsHwApiRes(location.weatherStation)
                : Promise.resolve(null),
        ]);

        return {
            solarTrackers: stInsights.data,
            weatherStation: wsInsights
        };
    }

    private async checkIfUserIsOwner(userId: string, locationId: string): Promise<Location & Document> {
        const location = await this.locationRepository.findById(locationId);

        if (!location) {
            throw new NotFoundException();
        }

        if (location.owner !== userId) {
            throw new ForbiddenException();
        }

        return location;
    }

    private async sendLocationUpdateNotification(currFcmToken: string, location: Location & Document): Promise<void> {
        location.sharedWith.forEach((user) => {
            user.fcmTokens.forEach((fcmToken) => {
                if (fcmToken === currFcmToken) {
                    return;
                }

                this.firebaseService.sendPushNotification(fcmToken, {
                    notificationType: NotificationType.LocationUpdate,
                    body: {
                        locationId: location.id,
                    }
                });
            });
        });
    }

    async getWeatherStationInsights(wsSerialNumber: string): Promise<WeatherStationInsightsDto> {
        return await this.getWeatherStationInsightsHwApiRes(wsSerialNumber);
    }

    async addWeatherStation(userId: string, currFcmToken: string, locationId: string, wsSerialNumber: string): Promise<void> {
        const [location, _] = await Promise.all([
            this.checkIfUserIsOwner(userId, locationId),
            this.validateWSCanBeAdd(wsSerialNumber)
        ]);

        if (location.weatherStation) {
            throw new ConflictException();
        }

        location.weatherStation = wsSerialNumber;
        await location.save();

        this.sendLocationUpdateNotification(currFcmToken, location);
    }

    async removeWeatherStation(userId: string, currFcmToken: string, locationId: string): Promise<void> {
        const location = await this.checkIfUserIsOwner(userId, locationId);

        location.weatherStation = null;
        await location.save();

        this.sendLocationUpdateNotification(currFcmToken, location);
    }

    async getSolarTrackersInsights(locationId: string, stSerialNumber: string): Promise<SolarTrackerInsightsDto> {
        const stInsights = await this.getSolarTrackersInsightsHwApiRes([stSerialNumber]);

        return stInsights.data[stSerialNumber];
    }

    async addSolarTracker(userId: string, currFcmToken: string, locationId: string, stSerialNumber: string): Promise<void> {
        const [location, solarTracker] = await Promise.all([
            this.checkIfUserIsOwner(userId, locationId),
            this.validateSTCanBeAdd(userId, stSerialNumber)
        ]);

        location.solarTrackers.push(solarTracker);
        await location.save();

        this.sendLocationUpdateNotification(currFcmToken, location);
    }

    async removeSolarTracker(userId: string, currFcmToken: string, locationId: string, stSerialNumber: string): Promise<void> {
        const location = await this.checkIfUserIsOwner(userId, locationId);
        location.solarTrackers = location.solarTrackers.filter((st) => st.serialNumber !== stSerialNumber);

        await location.save();

        this.sendLocationUpdateNotification(currFcmToken, location);
    }

    async remove(userId: string, currFcmToken: string, locationId: string, session: ClientSession): Promise<Location> {
        const location = await this.checkIfUserIsOwner(userId, locationId);
        const result = await this.locationRepository.deleteById(locationId, { session });

        if (result === 0) {
            throw new InternalServerErrorException();
        }

        this.sendLocationUpdateNotification(currFcmToken, location);

        return location;
    }
}