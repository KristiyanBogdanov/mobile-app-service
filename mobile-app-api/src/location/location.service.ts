import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';
import { plainToClass } from 'class-transformer';
import { UserService } from '../user/user.service';
import { HwApi } from '../shared/api';
import { LocationRepository } from './repository';
import { Location } from './schema';
import { AddLocationReq, LocationDto, ValidateSerialNumberHwApiRes, ValidateSerialNumberRes } from './dto';

@Injectable()
export class LocationService {
    constructor(
        private readonly hwApi: HwApi,
        private readonly httpService: HttpService,
        private readonly userService: UserService,
        private readonly locationRepository: LocationRepository
    ) { }

    async validateSTSerialNumber(userUuid: string, serialNumber: string): Promise<ValidateSerialNumberRes> {
        const isValid = await lastValueFrom(
            this.httpService.get<ValidateSerialNumberHwApiRes>(this.hwApi.validateSTSerialNumber(serialNumber))
        ).then((response) => response.data.isValid);

        if (!isValid) {
            return { isValid };
        }

        const location = await this.locationRepository.findOne({ solarTrackers: serialNumber });

        if (location) {
            const isAdded = location.sharedWith.includes(userUuid);
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

    private mapToLocationDto(userUuid: string, location: Location): LocationDto {
        const locationDto = plainToClass(LocationDto, location);
        locationDto.amIOwner = location.owner === userUuid;
        locationDto.sharedWith = locationDto.sharedWith.filter((uuid) => uuid !== userUuid);

        return locationDto;
    }

    async add(userUuid: string, locationData: AddLocationReq): Promise<LocationDto> {
        for (const serialNumber of locationData.solarTrackers) {
            const result = await this.validateSTSerialNumber(userUuid, serialNumber);

            if (!result.isValid) {
                throw new BadRequestException(`Invalid solar tracker serial number: ${serialNumber}`);
            }

            if (result.isUsed) {
                throw new ConflictException(`Solar tracker serial number: ${serialNumber} is already used`);
            }
        }

        if (locationData.weatherStation) {
            const result = await this.validateWSSerialNumber(locationData.weatherStation);

            if (!result.isValid) {
                throw new BadRequestException(`Invalid weather station serial number: ${locationData.weatherStation}`);
            }
        }

        const location = plainToClass(Location, locationData);
        location.uuid = uuidv4();
        location.owner = userUuid;
        location.sharedWith = [userUuid];

        const createdLocation = await this.locationRepository.create(location);
        this.userService.addLocation(userUuid, createdLocation.uuid);

        return this.mapToLocationDto(userUuid, createdLocation);
    }

    async fetchAll(userUuid: string, locationUuids: string[]): Promise<LocationDto[]> {
        const locations = await this.locationRepository.findAllWithUuidIn(locationUuids);

        return locations.map((location) => {
            return this.mapToLocationDto(userUuid, location);
        });
    }
}