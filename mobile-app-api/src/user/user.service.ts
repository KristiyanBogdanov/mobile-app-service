import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ErrorCode } from '../shared/exception';
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
    UserDto, SendHwNotificationReq, UpdateHwNotificationStatusReq, HwNotificationDto, 
    InvitationDto, SendInvitationReq, RespondToInvitationReq 
} from './dto';
import { Location } from '../location/schema';

@Injectable()
export class UserService {
    constructor(
        private readonly repository: UserRepository,
        private readonly locationRepository: LocationRepository,
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

    async mapToUserDto(user: User): Promise<UserDto> {
        const userDto = plainToClass(UserDto, user);
    
        userDto.locations = await Promise.all(
            user.locations.map(
                (location) => this.locationService.mapToLocationDto(user.id, location as any)
            )
        );

        userDto.hwNotifications = user.hwNotifications.map((notification) => plainToClass(HwNotificationDto, notification));
        userDto.invitations = user.invitations.map((invitation) => plainToClass(InvitationDto, invitation));

        return userDto;
    }

    async fetchData(userId: string): Promise<UserDto> {
        const user = await this.repository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        return this.mapToUserDto(user);
    }

    private async addLocationToUser(user: User, location: Location, session?: ClientSession) {
        const result = await this.repository.addLocation(user.id, location.id, session);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToAddLocation);
        }

        location.sharedWith.forEach((sharedWithUser) => {
            sharedWithUser.fcmTokens.forEach((fcmToken) => {
                this.firebaseService.sendPushNotification(
                    fcmToken,
                    {
                        notificationType: NotificationType.LocationUpdate,
                        body: {
                            locationId: location.id
                        }
                    },
                );
            });
        });

    }

    async addNewLocation(userId: string, currFcmToken: string, locationData: AddLocationReq): Promise<LocationDto> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const user = await this.repository.findById(userId);

            if (!user) {
                throw new NotFoundException();
            }

            const newLocation = await this.locationService.addNew(user, locationData, session);
            await this.addLocationToUser(user, newLocation, session);

            await session.commitTransaction();

            user.fcmTokens.forEach((fcmToken) => {
                if (fcmToken !== currFcmToken) {
                    this.firebaseService.sendPushNotification(
                        fcmToken,
                        {
                            notificationType: NotificationType.LocationUpdate,
                            body: {
                                locationId: newLocation.id
                            }
                        },
                    );
                }
            });

            return await this.locationService.mapToLocationDto(userId, newLocation as any);
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async inviteUserToLocation(userId: string, invitationData: SendInvitationReq): Promise<void> {
        const [owner, invitedUser, location] = await Promise.all([
            this.repository.findById(userId),
            this.repository.findOne({ email: invitationData.invitedUserEmail }),
            this.locationRepository.findById(invitationData.locationId)
        ]);

        if (!owner || !invitedUser || !location) {
            throw new NotFoundException();
        }

        if (location.owner !== userId) {
            throw new ForbiddenException();
        }

        if (invitedUser.locations.includes(location.id)) {
            throw new ConflictException();
        }

        console.log(location);
        console.log(invitedUser);

        if (invitedUser.invitations.some((invitation) => invitation.locationId === location.id)) {
            return;
        }

        const invitation = new Invitation({
            locationId: location.id,
            locationName: location.name,
            ownerUsername: owner.username,
            timestamp: new Date()
        });

        console.log(invitedUser.id);

        const result = await this.repository.addInvitation(invitedUser.id, invitation);

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

    async respondToInvitation(userId: string, currFcmToken: String, invitationId: string, responseData: RespondToInvitationReq): Promise<void> {
        const session = await this.repository.startSession();
        session.startTransaction();

        console.log(responseData);
        console.log(invitationId);

        try {
            const [user, location] = await Promise.all([
                this.repository.findById(userId, {}, { session }),
                (await this.locationRepository.findById(responseData.locationId, {}, {session})).populate('sharedWith')
            ]);
    
            if (!user || !location) {
                throw new NotFoundException();
            }
    
            const [removeInvitationRes, shareLocationRes] = await Promise.all([
                this.repository.removeInvitation(userId, invitationId, session),
                this.locationRepository.shareWith(userId, location.id, session)
            ]);

            if (removeInvitationRes === 0 || shareLocationRes === 0) {
                throw new InternalServerErrorException();
            }

            if (responseData.accepted) {
                await this.addLocationToUser(user, location, session);
            }

            await session.commitTransaction();

            user.fcmTokens.forEach((fcmToken) => {
                if (fcmToken == currFcmToken) {
                    return;
                }

                this.firebaseService.sendPushNotification(
                    fcmToken,
                    {
                        notificationType: NotificationType.InvititationsUpdate,
                        body: {
                            invitationId: invitationId
                        }
                    }
                );
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }        
    }

    async removeLocation(userId: string, currFcmToken: string, locationId: string): Promise<void> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const [_, result] = await Promise.all([
                this.locationService.remove(userId, currFcmToken, locationId, session),
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

    private async sendHwNotification(notificationData: SendHwNotificationReq, notificationType: NotificationType, notificationTitle: string): Promise<void> {
        const session = await this.repository.startSession();
        session.startTransaction();

        try {
            const users = await this.repository.findUsersWithDevice(notificationData.serialNumber, session);

            if (users.length === 0) {
                await session.abortTransaction();
                return;
            }

            const hwNotification = new HwNotification({
                ...notificationData,
                notificationType
            });

            const results = await Promise.all(
                users.map(async (user) => {
                    return await this.repository.addHwNotification(user.id, hwNotification, session);
                })
            );

            if (results.some((result) => result === 0)) {
                throw new InternalServerErrorException();
            }

            await session.commitTransaction();

            const fcmTokens = users.map((user) => user.fcmTokens).flat();
            const uniqueTokens = [...new Set(fcmTokens)];

            const hwNotificationDto = plainToClass(HwNotificationDto, hwNotification);
            console.log(hwNotificationDto);

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
            session.endSession();
        }
    }

    async sendInactiveDevicesNotification(notificationData: SendHwNotificationReq): Promise<void> {
        await this.sendHwNotification(notificationData, NotificationType.InactiveDevice, INACTIVE_DEVICE_NOTIFICATION_TITLE);
    }

    async sendDeviceStateReportNotification(notificationData: SendHwNotificationReq): Promise<void> {
        await this.sendHwNotification(notificationData, NotificationType.DeviceStateReport, DEVICE_STATE_REPORT_NOTIFICATION_TITLE);
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