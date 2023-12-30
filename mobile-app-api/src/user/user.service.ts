import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ErrorCode } from '../shared/exception';
import { AddLocationReq, LocationDto } from '../location/dto';
import { LocationService } from '../location/location.service';
import { UserRepository } from './repository';
import { BriefUserInfo, User } from './schema';
import { UserDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly locationService: LocationService   
    ) { }

    async create(user: User): Promise<User> {
        const emailIsAlreadyUsed = await this.userRepository.findOne({ email: user.email });

        if (emailIsAlreadyUsed) {
            throw new ConflictException(ErrorCode.EmailIsAlreadyUsed);
        }

        return await this.userRepository.create(user);
    }

    async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({ email });
    }

    mapToUserDto(user: User): UserDto {
        const userDto = plainToClass(UserDto, user);
        userDto.locations = user.locations.map(
            (location) => this.locationService.mapToLocationDto(user.uuid, location)
        );

        return userDto;
    }  

    async fetchData(userUuid: string): Promise<UserDto> {
        const user = await this.userRepository.findOne({ uuid: userUuid });

        if (!user) {
            throw new NotFoundException(ErrorCode.UserNotFound);
        }

        return this.mapToUserDto(user);
    }

    private async getBriefUserInfo(userUuid: string, session?: ClientSession): Promise<BriefUserInfo> {
        const user = await this.userRepository.findOne({ uuid: userUuid }, {}, { session });

        if (!user) {
            throw new NotFoundException(ErrorCode.UserNotFound);
        }

        return { uuid: user.uuid, username: user.username };
    }

    private async addLocationToUser(userUuid: string, locationOid: string, session: ClientSession) {
        const result = await this.userRepository.addLocation(userUuid, locationOid, session);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToAddLocation);
        }
    }

    async addNewLocation(userUuid: string, locationData: AddLocationReq): Promise<LocationDto> {
        const session = await this.userRepository.startSession();
        session.startTransaction();

        try {
            const briefUser = await this.getBriefUserInfo(userUuid, session);

            const newLocation = await this.locationService.addNew(briefUser, locationData, session);
            await this.addLocationToUser(userUuid, newLocation._id, session);

            await session.commitTransaction();
            session.endSession();

            return this.locationService.mapToLocationDto(userUuid, newLocation);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async addExistingLocation(userUuid: string, locationUuid: string): Promise<LocationDto> {
        const session = await this.userRepository.startSession();
        session.startTransaction();

        try {
            const briefUser = await this.getBriefUserInfo(userUuid, session);

            const location = await this.locationService.share(briefUser, locationUuid, session);
            await this.addLocationToUser(userUuid, location._id, session);

            await session.commitTransaction();
            session.endSession();

            return this.locationService.mapToLocationDto(userUuid, location);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}