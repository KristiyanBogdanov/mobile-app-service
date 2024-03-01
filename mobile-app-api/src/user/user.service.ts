import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientSession, Document } from 'mongoose';
import { plainToClass } from 'class-transformer';
import {
    DEVICE_STATE_REPORT_NOTIFICATION_TITLE, INACTIVE_DEVICE_NOTIFICATION_TITLE,
    INVITATION_NOTIFICATION_TITLE, getInvitationNotificationMessage
} from '../shared/constants';
import { AddLocationReq, LocationDto } from '../location/dto';
import { LocationRepository } from '../location/repository';
import { LocationService } from '../location/location.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationType } from '../firebase/enum';
import { UserRepository } from './repository';
import { HwNotification, Invitation, User } from './schema';
import {
    UserDto, SendHwNotificationReq, HwNotificationDto,
    InvitationDto, SendInvitationReq, RespondToInvitationReq
} from './dto';
import { Location } from '../location/schema';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly locationRepository: LocationRepository,
        private readonly locationService: LocationService,
        private readonly firebaseService: FirebaseService
    ) { }

    async create(user: User, session: ClientSession): Promise<User> {
        const emailIsAlreadyUsed = await this.userRepository.findOne({ email: user.email });

        if (emailIsAlreadyUsed) {
            throw new ConflictException();
        }

        return await this.userRepository.createInSession(user, session);
    }

    async mapToUserDto(user: User): Promise<UserDto> {
        const userDto = plainToClass(UserDto, user);

        userDto.locations = await Promise.all(
            user.locations.map(
                async (location) => this.locationService.mapToLocationDto(user.id, location as (Location & Document))
            )
        );

        userDto.hwNotifications = user.hwNotifications.map((notification) => plainToClass(HwNotificationDto, notification)).reverse();
        userDto.invitations = user.invitations.map((invitation) => plainToClass(InvitationDto, invitation));

        return userDto;
    }

    async fetchData(userId: string): Promise<UserDto> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        return this.mapToUserDto(user);
    }

    async addNewLocation(userId: string, currFcmToken: string, locationData: AddLocationReq): Promise<LocationDto> {
        const session = await this.userRepository.startSession();
        session.startTransaction();

        try {
            const user = await this.userRepository.findById(userId, {}, { session });

            if (!user) {
                throw new NotFoundException();
            }

            const newLocation = await this.locationService.addNew(user, locationData, session);
            const result = await this.userRepository.addLocation(user.id, newLocation.id, session);

            if (result === 0) {
                throw new InternalServerErrorException();
            }

            await session.commitTransaction();

            this.locationService.sendLocationUpdateNotification(currFcmToken, newLocation);

            return await this.locationService.mapToLocationDto(userId, newLocation as (Location & Document));
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async removeLocation(userId: string, currFcmToken: string, locationId: string): Promise<void> {
        const session = await this.userRepository.startSession();
        session.startTransaction();

        try {
            const location = await this.locationService.remove(userId, currFcmToken, locationId, session);
            const results = await Promise.all(
                location.sharedWith.map((user) => this.userRepository.removeLocation(user.id, locationId, session))
            );

            if (results.some((result) => result === 0)) {
                throw new InternalServerErrorException();
            }

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async inviteUserToLocation(userId: string, invitationData: SendInvitationReq): Promise<void> {
        const [owner, invitedUser, location] = await Promise.all([
            this.userRepository.findById(userId),
            this.userRepository.findOne({ email: invitationData.invitedUserEmail }),
            this.locationRepository.findById(invitationData.locationId)
        ]);

        if (!owner || !invitedUser || !location) {
            throw new NotFoundException();
        }

        if (location.owner !== userId) {
            throw new ForbiddenException();
        }

        if (invitedUser.locations.some((location) => location.id === invitationData.locationId)) {
            throw new ConflictException();
        }

        if (invitedUser.invitations.some((invitation) => invitation.locationId === location.id)) {
            return;
        }

        const invitation = new Invitation({
            locationId: location.id,
            locationName: location.name,
            ownerUsername: owner.username,
            timestamp: new Date()
        });

        const result = await this.userRepository.addInvitation(invitedUser.id, invitation);

        if (result === 0) {
            throw new InternalServerErrorException();
        }

        const invitationDto = plainToClass(InvitationDto, invitation);

        invitedUser.fcmTokens.forEach((fcmToken) => {
            this.firebaseService.sendPushNotification(
                fcmToken,
                {
                    notificationType: NotificationType.Invitation,
                    body: invitationDto
                },
                {
                    title: INVITATION_NOTIFICATION_TITLE,
                    body: getInvitationNotificationMessage(location.name, owner.username)
                },
            );
        });
    }

    async respondToInvitation(userId: string, currFcmToken: string, invitationId: string, responseData: RespondToInvitationReq): Promise<void> {
        const session = await this.userRepository.startSession();
        session.startTransaction();

        try {
            const user = await this.userRepository.findById(userId, {}, { session });

            if (!user) {
                throw new NotFoundException();
            }

            const invitation = user.invitations.find((invitation) => invitation.id === invitationId);

            if (!invitation) {
                throw new NotFoundException();
            }

            const location = await (await this.locationRepository.findById(invitation.locationId, {}, { session })).populate('sharedWith');

            if (!location) {
                throw new NotFoundException();
            }

            if (responseData.accepted) {
                location.sharedWith.push(user);
            }

            const removeInvitationRes = await this.userRepository.removeInvitation(userId, invitationId, session);

            if (removeInvitationRes === 0) {
                throw new InternalServerErrorException();
            }

            const [_, addLocationRes] = await Promise.all([
                responseData.accepted ? location.save({ session }) : Promise.resolve(),
                responseData.accepted ? this.userRepository.addLocation(userId, location.id, session) : Promise.resolve()
            ]);

            if (addLocationRes === 0) {
                throw new InternalServerErrorException();
            }

            await session.commitTransaction();

            user.fcmTokens.forEach((fcmToken) => {
                if (fcmToken == currFcmToken) {
                    return;
                }

                this.firebaseService.sendPushNotification(
                    fcmToken,
                    {
                        notificationType: NotificationType.InvititationUpdate,
                        body: {
                            invitationId: invitationId
                        }
                    }
                );
            });

            this.locationService.sendLocationUpdateNotification(currFcmToken, location, false);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    private async sendHwNotification(notificationData: SendHwNotificationReq, notificationType: NotificationType, notificationTitle: string): Promise<void> {
        const session = await this.userRepository.startSession();
        session.startTransaction();

        try {
            const users = await this.userRepository.findUsersWithDevice(notificationData.serialNumber, session);

            if (users.length === 0) {
                await session.abortTransaction();
                return;
            }

            const hwNotification = new HwNotification({
                ...notificationData,
                notificationType
            });

            const results = await Promise.all(
                users.map((user) => this.userRepository.addHwNotification(user.id, hwNotification, session))
            );

            if (results.some((result) => result === 0)) {
                throw new InternalServerErrorException();
            }

            await session.commitTransaction();

            const fcmTokens = users.map((user) => user.fcmTokens).flat();
            const uniqueTokens = [...new Set(fcmTokens)];

            const hwNotificationDto = plainToClass(HwNotificationDto, hwNotification);

            uniqueTokens.forEach((fcmToken) => {
                this.firebaseService.sendPushNotification(
                    fcmToken,
                    {
                        notificationType: notificationType,
                        body: hwNotificationDto
                    },
                    {
                        title: notificationTitle,
                        body: notificationData.message
                    }
                );
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async sendInactiveDevicesNotification(notificationData: SendHwNotificationReq): Promise<void> {
        await this.sendHwNotification(notificationData, NotificationType.InactiveDevice, INACTIVE_DEVICE_NOTIFICATION_TITLE);
    }

    async sendDeviceStateReportNotification(notificationData: SendHwNotificationReq): Promise<void> {
        await this.sendHwNotification(notificationData, NotificationType.DeviceStateReport, DEVICE_STATE_REPORT_NOTIFICATION_TITLE);
    }

    async deleteHwNotification(userId: string, currFcmToken: string, notificationId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        const filteredHwNotifications = user.hwNotifications.filter((notification) => notification.id !== notificationId);

        if (filteredHwNotifications.length === user.hwNotifications.length) {
            throw new NotFoundException();
        }

        user.hwNotifications = filteredHwNotifications;
        await user.save();

        user.fcmTokens.forEach((fcmToken) => {
            if (fcmToken == currFcmToken) {
                return;
            }

            this.firebaseService.sendPushNotification(
                fcmToken,
                {
                    notificationType: NotificationType.HwNotificationUpdate,
                    body: {
                        hwNotificationId: notificationId
                    }
                }
            );
        });
    }
}