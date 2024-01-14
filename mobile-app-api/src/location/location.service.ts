import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { ClientSession } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { HwApi } from '../shared/api';
import { ErrorCode } from '../shared/exception';
import { BriefUserInfo } from '../user/schema';
import { LocationRepository } from './repository';
import { Location } from './schema';
import {
    AddLocationReq, LocationDto,
    ValidateSerialNumberHwApiRes, ValidateSerialNumberRes,
    GetLocationInsightsRes, SolarTrackersInsightsHwApiRes, WeatherStationInsightsHwApiRes
} from './dto';

@Injectable()
export class LocationService {
    constructor(
        private readonly hwApi: HwApi,
        private readonly httpService: HttpService,
        private readonly locationRepository: LocationRepository
    ) { }

    async validateSTSerialNumber(userUuid: string, serialNumber: string, session?: ClientSession): Promise<ValidateSerialNumberRes> {
        const isValid = await lastValueFrom(
            this.httpService.get<ValidateSerialNumberHwApiRes>(this.hwApi.validateSTSerialNumber(serialNumber))
        ).then((response) => response.data.isValid);

        if (!isValid) {
            return { isValid };
        }

        const location = await this.locationRepository.findOne({ solarTrackers: serialNumber }, {}, { session });

        if (location) {
            const isAdded = location.sharedWith.some((user) => user.uuid === userUuid);
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

    mapToLocationDto(userUuid: string, location: Location): LocationDto {
        const locationDto = plainToClass(LocationDto, location, { enableCircularCheck: true }); // TODO: try to remove enableCircularCheck
        locationDto.sharedWith = locationDto.sharedWith.filter((user) => user.uuid !== userUuid);
        locationDto.amIOwner = location.owner === userUuid;

        return locationDto;
    }

    // TODO: try to optimize this method
    async addNew(briefUser: BriefUserInfo, locationData: AddLocationReq, session: ClientSession): Promise<Location> {
        for (const serialNumber of locationData.solarTrackers) {
            const result = await this.validateSTSerialNumber(briefUser.uuid, serialNumber, session);

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
        location.owner = briefUser.uuid;
        location.sharedWith = [briefUser];

        return await this.locationRepository.createInSession(location, session);
    }

    // TODO: add share requests that need to be accepted by the owner in the future
    async share(briefUser: BriefUserInfo, locationUuid: string, session: ClientSession): Promise<Location> {
        const location = await this.locationRepository.findOne({ uuid: locationUuid }, {}, { session });

        if (!location) {
            throw new BadRequestException(ErrorCode.InvalidLocationUuid);
        }

        if (location.sharedWith.some((user) => user.uuid === briefUser.uuid)) {
            throw new ConflictException(ErrorCode.LocationAlreadyAdded);
        }

        const result = await this.locationRepository.shareWith(briefUser, locationUuid, session);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToAddLocation);
        }

        return location;
    }

    async getInsights(locationUuid: string): Promise<GetLocationInsightsRes> {
        const location = await this.locationRepository.findOne({ uuid: locationUuid });

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