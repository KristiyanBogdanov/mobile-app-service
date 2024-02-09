import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
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
    AddLocationReq, LocationDto,
    ValidateSTSerialNumberHwApiRes, ValidateWSSerialNumberHwApiRes, ValidateSerialNumberRes,
    GetLocationInsightsRes, SolarTrackersInsightsHwApiRes, WeatherStationInsightsHwApiRes,
    GetLocationLimitsRes,
    WeatherStationInsightsDto,
    SolarTrackerInsightsDto
} from './dto';

@Injectable()
export class LocationService {
    constructor(
        private readonly hwApi: HwApi,
        private readonly httpService: HttpService,
        private readonly locationRepository: LocationRepository,
        private readonly firebaseService: FirebaseService
    ) { }

    getLimits(): GetLocationLimitsRes {
        return {
            nameMinLength: LOCATION_NAME_MIN_LENGTH,
            nameMaxLength: LOCATION_NAME_MAX_LENGTH,
        };
    }

    async getLocation(userId: string, locationId: string): Promise<LocationDto> {
        const location = await this.locationRepository.findById(locationId);

        if (!location) {
            throw new NotFoundException();
        }

        return await this.mapToLocationDto(userId, location);
    }

    async validateSTSerialNumber(userId: string, serialNumber: string, session?: ClientSession): Promise<{
        validateSTSerialNumberRes: ValidateSerialNumberRes,
        capacity?: number
    }> {
        const response = await lastValueFrom(
            this.httpService.get<ValidateSTSerialNumberHwApiRes>(this.hwApi.validateSTSerialNumber(serialNumber))
        ).then((response) => response.data);

        if (!response.isValid) {
            return { 
                validateSTSerialNumberRes: { isValid: false }
            };
        }

        const location = await this.locationRepository.findOne({ solarTrackers: serialNumber }, {}, { session });

        if (location) {
            const isAdded = location.sharedWith.some((user) => user.id === userId);
            return { 
                validateSTSerialNumberRes: { isValid: true, isUsed: true, isAdded }
            };
        }

        return { 
            validateSTSerialNumberRes: { isValid: true, isUsed: false }, 
            capacity: response.capacity 
        };
    }

    async validateWSSerialNumber(serialNumber: string): Promise<ValidateSerialNumberRes> {
        const isValid = await lastValueFrom(
            this.httpService.get<ValidateWSSerialNumberHwApiRes>(this.hwApi.validateWSSerialNumber(serialNumber))
        ).then((response) => response.data.isValid);

        return { isValid };
    }

    async mapToLocationDto(userId: string, location: Location & Document): Promise<LocationDto> {
        await location.populate('sharedWith');
        
        const sharedWithFiltered = location.sharedWith.filter((user) => user.id !== userId);
        
        const locationDto = plainToClass(LocationDto, location);
        locationDto.sharedWith = sharedWithFiltered.map((user) => plainToClass(BriefUserInfo, user));
        locationDto.amIOwner = location.owner === userId;

        return locationDto;
    }

    private async validateSTCanBeAdd(userId: string, serialNumber: string, session?: ClientSession): Promise<number> {
        const result = await this.validateSTSerialNumber(userId, serialNumber, session);

        if (!result.validateSTSerialNumberRes.isValid) {
            throw new BadRequestException();
        }

        if (result.validateSTSerialNumberRes.isUsed) {
            throw new ConflictException();
        }

        return result.capacity;
    }

    private async validateWSCanBeAdd(serialNumber: string): Promise<void> {
        const result = await this.validateWSSerialNumber(serialNumber);

        if (!result.isValid) {
            throw new BadRequestException();
        }
    }

    // TODO: try to optimize this method
    async addNew(user: User, locationData: AddLocationReq, session: ClientSession): Promise<Location> {
        let capacity = 0;

        for (const serialNumber of locationData.solarTrackers) {
            const result = await this.validateSTCanBeAdd(user.id, serialNumber, session);
            capacity += result;
        }

        if (locationData.weatherStation) {
            await this.validateWSCanBeAdd(locationData.weatherStation);
        }

        const location = plainToClass(Location, locationData);
        location.uuid = uuidv4();
        location.capacity = capacity;
        location.owner = user.id;
        location.sharedWith = [user];

        return await this.locationRepository.createInSession(location, session);
    }

    // TODO: add share requests that need to be accepted by the owner in the future
    async share(user: User, locationUuid: string, session: ClientSession): Promise<Location> {
        const location = await this.locationRepository.findOne({ uuid: locationUuid }, {}, { session });

        if (!location) {
            throw new BadRequestException();
        }

        if (location.sharedWith.some((alreadySharedUser) => alreadySharedUser.id === user.id)) {
            throw new ConflictException();
        }

        const result = await this.locationRepository.shareWith(user.id, location.id, session);

        if (result === 0) {
            throw new InternalServerErrorException();
        }

        return location;
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
            this.getSolarTrackersInsightsHwApiRes(location.solarTrackers),
            location.weatherStation
                ? this.getWeatherStationInsightsHwApiRes(location.weatherStation)
                : undefined,
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
        await location.populate('sharedWith');

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
        const location = await this.checkIfUserIsOwner(userId, locationId);
        await this.validateWSCanBeAdd(wsSerialNumber);

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
        const location = await this.checkIfUserIsOwner(userId, locationId);
        const capacity = await this.validateSTCanBeAdd(userId, stSerialNumber);
        
        location.solarTrackers.push(stSerialNumber);
        location.capacity += capacity;
        await location.save();

        this.sendLocationUpdateNotification(currFcmToken, location);
    }

    async removeSolarTracker(userId: string, currFcmToken: string, locationId: string, stSerialNumber: string): Promise<void> {
        const location = await this.checkIfUserIsOwner(userId, locationId);

        const index = location.solarTrackers.indexOf(stSerialNumber);

        if (index === -1) {
            throw new NotFoundException();
        }

        location.solarTrackers.splice(index, 1);
        location.capacity -= 6; // TODO: change this to the real capacity
        await location.save();

        this.sendLocationUpdateNotification(currFcmToken, location);
    }

    async remove(userId: string, currFcmToken: string, locationId: string, session: ClientSession): Promise<void> {
        const location = await this.checkIfUserIsOwner(userId, locationId);

        const result = await this.locationRepository.deleteById(locationId, { session });

        if (result === 0) {
            throw new InternalServerErrorException(); // TODO: check why I need this
        }

        this.sendLocationUpdateNotification(currFcmToken, location);
    }
}