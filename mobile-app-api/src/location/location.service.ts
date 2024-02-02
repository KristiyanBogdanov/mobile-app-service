import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { ClientSession } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { HwApi } from '../shared/api';
import { ErrorCode } from '../shared/exception';
import { LOCATION_NAME_MAX_LENGTH, LOCATION_NAME_MIN_LENGTH } from '../shared/constants';
import { BriefUserInfo } from '../user/schema';
import { LocationRepository } from './repository';
import { Location } from './schema';
import {
    AddLocationReq, LocationDto,
    ValidateSerialNumberHwApiRes, ValidateSerialNumberRes,
    GetLocationInsightsRes, SolarTrackersInsightsHwApiRes, WeatherStationInsightsHwApiRes,
    GetLocationLimitsRes
} from './dto';

@Injectable()
export class LocationService {
    constructor(
        private readonly hwApi: HwApi,
        private readonly httpService: HttpService,
        private readonly locationRepository: LocationRepository
    ) { }

    getLimits(): GetLocationLimitsRes {
        return {
            nameMinLength: LOCATION_NAME_MIN_LENGTH,
            nameMaxLength: LOCATION_NAME_MAX_LENGTH,
        };
    }

    async validateSTSerialNumber(userId: string, serialNumber: string, session?: ClientSession): Promise<ValidateSerialNumberRes> {
        const isValid = await lastValueFrom(
            this.httpService.get<ValidateSerialNumberHwApiRes>(this.hwApi.validateSTSerialNumber(serialNumber))
        ).then((response) => response.data.isValid);

        if (!isValid) {
            return { isValid };
        }

        const location = await this.locationRepository.findOne({ solarTrackers: serialNumber }, {}, { session });

        if (location) {
            const isAdded = location.sharedWith.some((user) => user.id === userId);
            return { isValid, isUsed: true, isAdded };
        }

        return { isValid, isUsed: false };
    }

    async validateWSSerialNumber(serialNumber: string): Promise<ValidateSerialNumberRes> {
        const isValid = await lastValueFrom(
            this.httpService.get<ValidateSerialNumberHwApiRes>(this.hwApi.validateWSSerialNumber(serialNumber))
        ).then((response) => response.data.isValid);

        return { isValid };
    }

    mapToLocationDto(userId: string, location: Location): LocationDto {
        const locationDto = plainToClass(LocationDto, location, { enableCircularCheck: true }); // TODO: try to remove enableCircularCheck
        locationDto.sharedWith = locationDto.sharedWith.filter((user) => user.id !== userId);
        locationDto.amIOwner = location.owner === userId;

        return locationDto;
    }

    // TODO: try to optimize this method
    async addNew(briefUser: BriefUserInfo, locationData: AddLocationReq, session: ClientSession): Promise<Location> {
        for (const serialNumber of locationData.solarTrackers) {
            const result = await this.validateSTSerialNumber(briefUser.id, serialNumber, session);

            if (!result.isValid) {
                throw new BadRequestException(ErrorCode.InvalidSTSerialNumber);
            }

            if (result.isUsed) {
                throw new ConflictException(ErrorCode.STSerialNumberAlreadyUsed);
            }
        }

        if (locationData.weatherStation) {
            const result = await this.validateWSSerialNumber(locationData.weatherStation);

            if (!result.isValid) {
                throw new BadRequestException(ErrorCode.InvalidWSSerialNumber);
            }
        }

        const location = plainToClass(Location, locationData);
        location.uuid = uuidv4();
        location.owner = briefUser.id;
        location.sharedWith = [briefUser];

        return await this.locationRepository.createInSession(location, session);
    }

    // TODO: add share requests that need to be accepted by the owner in the future
    async share(briefUser: BriefUserInfo, locationUuid: string, session: ClientSession): Promise<Location> {
        const location = await this.locationRepository.findOne({ uuid: locationUuid }, {}, { session });

        if (!location) {
            throw new BadRequestException(ErrorCode.InvalidLocationUuid);
        }

        if (location.sharedWith.some((user) => user.id === briefUser.id)) {
            throw new ConflictException(ErrorCode.LocationAlreadyAdded);
        }

        const result = await this.locationRepository.shareWith(briefUser, location.id, session);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToAddLocation);
        }

        return location;
    }

    async getInsights(locationId: string): Promise<GetLocationInsightsRes> {
        const location = await this.locationRepository.findById(locationId);

        if (!location) {
            throw new NotFoundException(ErrorCode.LocationNotFound);
        }

        const [stInsights, wsInsights] = await Promise.all([
            lastValueFrom(
                this.httpService.post<SolarTrackersInsightsHwApiRes>(
                    this.hwApi.getSTInsights(),
                    { serialNumbers: location.solarTrackers }
                )
            ).then((response) => response.data),
            location.weatherStation
                ? lastValueFrom(
                      this.httpService.get<WeatherStationInsightsHwApiRes>(
                          this.hwApi.getWSInsights(location.weatherStation)
                      )
                  ).then((response) => response.data)
                : undefined,
        ]);

        // TODO: calculate the centroid of all solar trackers coordinates

        return {
            coordinates: null, // TODO: change this to the centroid
            solarTrackers: stInsights.data,
            weatherStation: wsInsights
        };
    }
}