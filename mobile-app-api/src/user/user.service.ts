import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ErrorCode } from '../shared/exception';
import { AddLocationReq, LocationDto } from '../location/dto';
import { SendHwNotificationReq } from '../hw-notification/dto';
import { LocationService } from '../location/location.service';
import { HwNotificationService } from '../hw-notification/hw-notification.service';
import { UserRepository } from './repository';
import { BriefUserInfo, User } from './schema';
import { UserDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        private readonly repository: UserRepository,
        private readonly locationService: LocationService,
        private readonly hwNotificationService: HwNotificationService
    ) { }

    async create(user: User): Promise<User> {
        const emailIsAlreadyUsed = await this.repository.findOne({ email: user.email });

        if (emailIsAlreadyUsed) {
            throw new ConflictException(ErrorCode.EmailIsAlreadyUsed);
        }

        return await this.repository.create(user);
    }

    async findByEmail(email: string): Promise<User> {
        return await this.repository.findOne({ email });
    }

    async updateFcmTokens(userUuid: string, fcmToken: string): Promise<number> {
        return await this.repository.updateFcmTokens(userUuid, fcmToken);
    }

    mapToUserDto(user: User): UserDto {
        const userDto = plainToClass(UserDto, user);
        userDto.locations = user.locations.map(
            (location) => this.locationService.mapToLocationDto(user.uuid, location)
        );
        userDto.hwNotifications = user.hwNotifications.map(this.hwNotificationService.mapToHwNotificationDto);

        return userDto;
    }

    // TODO: check the usage of this method
    async fetchData(userUuid: string): Promise<UserDto> {
        const user = await this.repository.findOne({ uuid: userUuid });

        if (!user) {
            throw new NotFoundException(ErrorCode.UserNotFound);
        }

        return this.mapToUserDto(user);
    }

    private async getBriefUserInfo(userUuid: string, session?: ClientSession): Promise<BriefUserInfo> {
        const user = await this.repository.findOne({ uuid: userUuid }, {}, { session });

        if (!user) {
            throw new NotFoundException(ErrorCode.UserNotFound);
        }

        return { uuid: user.uuid, username: user.username };
    }

    private async addLocationToUser(userUuid: string, locationOid: string, session: ClientSession) {
        const result = await this.repository.addLocation(userUuid, locationOid, session);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToAddLocation);
        }
    }

    async addNewLocation(userUuid: string, locationData: AddLocationReq): Promise<LocationDto> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const briefUser = await this.getBriefUserInfo(userUuid, session);

            const newLocation = await this.locationService.addNew(briefUser, locationData, session);
            await this.addLocationToUser(userUuid, newLocation._id, session);

            await session.commitTransaction();

            return this.locationService.mapToLocationDto(userUuid, newLocation);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async addExistingLocation(userUuid: string, locationUuid: string): Promise<LocationDto> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const briefUser = await this.getBriefUserInfo(userUuid, session);

            const location = await this.locationService.share(briefUser, locationUuid, session);
            await this.addLocationToUser(userUuid, location._id, session);

            await session.commitTransaction();

            return this.locationService.mapToLocationDto(userUuid, location);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async sendHwNotification(notificationData: SendHwNotificationReq): Promise<void> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const users = await this.repository.findUsersWithDevice(notificationData.serialNumber, session);
            
            if (users.length !== 0) {
                const hwNotification = await this.hwNotificationService.create(notificationData, session);

                const results = await Promise.all(
                    users.map(async (user) => {
                        return await this.repository.addHwNotification(user.uuid, hwNotification._id, session);
                    })
                );

                if (results.some((result) => result === 0)) {
                    throw new InternalServerErrorException(ErrorCode.FailedToSendHwNotification);
                }
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}