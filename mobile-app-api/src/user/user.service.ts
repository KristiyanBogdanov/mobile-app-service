import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientSession, Document } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ErrorCode } from '../shared/exception';
import { AddLocationReq, LocationDto } from '../location/dto';
import { LocationService } from '../location/location.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserRepository } from './repository';
import { HwNotification, User } from './schema';
import { UserDto, SendHwNotificationReq, UpdateHwNotificationStatusReq, HwNotificationDto } from './dto';

@Injectable()
export class UserService {
    constructor(
        private readonly repository: UserRepository,
        private readonly locationService: LocationService,
        private readonly firebaseService: FirebaseService
    ) { }

    async create(user: User, session: ClientSession): Promise<User> {
        const emailIsAlreadyUsed = await this.repository.findOne({ email: user.email });

        if (emailIsAlreadyUsed) {
            throw new ConflictException();
        }

        return await this.repository.createInSession(user, session);
    }

    private mapToHwNotificationDto(hwNotification: HwNotification): HwNotificationDto {
        const hwNotificationDto = plainToClass(HwNotificationDto, hwNotification);

        return hwNotificationDto;
    }

    async mapToUserDto(user: User): Promise<UserDto> {
        const userDto = plainToClass(UserDto, user);
    
        userDto.locations = await Promise.all(
            user.locations.map(
                (location) => this.locationService.mapToLocationDto(user.id, location as any)
            )
        );

        userDto.hwNotifications = user.hwNotifications.map(this.mapToHwNotificationDto);

        return userDto;
    }

    async fetchData(userId: string): Promise<UserDto> {
        const user = await this.repository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        return this.mapToUserDto(user);
    }

    private async addLocationToUser(userId: string, locationId: string, session: ClientSession) {
        const result = await this.repository.addLocation(userId, locationId, session);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToAddLocation);
        }
    }

    async addNewLocation(userId: string, locationData: AddLocationReq): Promise<LocationDto> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const user = await this.repository.findById(userId);

            if (!user) {
                throw new NotFoundException();
            }

            const newLocation = await this.locationService.addNew(user, locationData, session);
            await this.addLocationToUser(userId, newLocation.id, session);

            await session.commitTransaction();

            return await this.locationService.mapToLocationDto(userId, newLocation as any);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async addExistingLocation(userId: string, locationUuid: string): Promise<LocationDto> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const user = await this.repository.findById(userId);

            if (!user) {
                throw new NotFoundException();
            }

            const location = await this.locationService.share(user, locationUuid, session);
            await this.addLocationToUser(userId, location.id, session);

            await session.commitTransaction();

            return this.locationService.mapToLocationDto(userId, location as any);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async removeLocation(userId: string, locationId: string): Promise<void> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const [_, result] = await Promise.all([
                this.locationService.remove(userId, locationId, session),
                this.repository.removeLocation(userId, locationId, session)
            ]);

            if (result === 0) {
                throw new InternalServerErrorException();
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // private findExpiredHwNotifications(users: User[]): String[] {
    //     const expiredNotifications = users.map((user) => {
    //         return user.hwNotifications
    //             .filter((hwNotification) => hwNotification.expiredAt < new Date())
    //             .map((hwNotification) => hwNotification._id);
    //     }).flat();

    //     return [...new Set(expiredNotifications)];
    // }

    async sendHwNotification(notificationData: SendHwNotificationReq): Promise<void> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const users = await this.repository.findUsersWithDevice(notificationData.serialNumber, session);

            if (users.length === 0) {
                await session.commitTransaction();
                return;
            }


            
            // const expiredNotifications = await this.hwNotificationService.findExpiredHwNotifications(session);

            const hwNotification = new HwNotification(notificationData);

            const results = await Promise.all(
                users.map(async (user) => {
                    console.log(user.id);
                    return await this.repository.addHwNotification(user.id, hwNotification, session);
                })
            );

            if (results.some((result) => result === 0)) {
                throw new InternalServerErrorException(ErrorCode.FailedToSendHwNotification);
            }

            await session.commitTransaction();

            const fcmTokens = users.map((user) => user.fcmTokens).flat();
            const uniqueTokens = [...new Set(fcmTokens)];

            uniqueTokens.forEach((fcmToken) => {
                this.firebaseService.sendPushNotification(fcmToken, notificationData.notificationType, notificationData.message);
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getNotifications(userId: string): Promise<HwNotificationDto[]> {
        const user = await this.repository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        return user.hwNotifications.map(this.mapToHwNotificationDto);
    }

    async updateHwNotificationStatus(userId: string, notificationId: string, updateData: UpdateHwNotificationStatusReq): Promise<void> {
        const result = await this.repository.updateHwNotificationStatus(userId, notificationId, updateData.status);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToUpdateHwNotification);
        }
    }

    async deleteHwNotification(userId: string, notificationId: string): Promise<void> {
        const result = await this.repository.deleteHwNotification(userId, notificationId);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToDeleteHwNotification);
        }
    }
}