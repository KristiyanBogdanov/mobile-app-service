import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Document, Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { HwNotification, Invitation, User } from '../schema';

@Injectable()
export class UserRepository extends EntityRepository<User> {
    constructor(@InjectModel(User.name) userModel: Model<User>) {
        super(userModel);
    }

    async findById(
        entityId: string,
        projection?: Record<string, unknown>,
        options?: Record<string, unknown>
    ): Promise<(User & Document) | null> {
        return await super.findById(entityId, projection, options)
            .then((user) => user?.populate('locations hwNotifications'));
    }

    async findOne(
        filter: Record<string, unknown>,
        projection?: Record<string, unknown>,
        options?: Record<string, unknown>
    ): Promise<(User & Document) | null> {
        return await super.findOne(filter, projection, options)
            .then((user) => user?.populate('locations hwNotifications'));
    }

    async updateRefreshToken(userId: string, refreshToken: string, session?: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $set: { refreshToken } },
            { session }
        );
    }

    async updateFcmTokens(userId: string, fcmToken: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $addToSet: { fcmTokens: fcmToken } },
            { session }
        );
    }

    async removeFcmToken(userId: string, fcmToken: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $pull: { fcmTokens: fcmToken } },
            { session }
        );
    }

    async addLocation(userId: string, locationId: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $addToSet: { locations: locationId } },
            { session }
        );
    }

    async removeLocation(userId: string, locationId: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $pull: { locations: locationId } },
            { session }
        );
    }

    async addInvitation(userId: string, invitation: Invitation): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $push: { invitations: invitation } }
        );
    }

    async removeInvitation(userId: string, invitationId: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $pull: { invitations: { _id: invitationId } } },
            { session }
        );
    }

    // TODO: need to be test more carefully (edge cases)
    async findUsersWithDevice(serialNumber: string, session: ClientSession): Promise<User[]> {
        return await this.aggregate([
            {
                $lookup: {
                    from: 'locations',
                    localField: 'locations',
                    foreignField: '_id',
                    as: 'locations'
                }
            },
            {
                $match: {
                    $or: [
                        { 'locations.solarTrackers.serialNumber': serialNumber },
                        { 'locations.weatherStation': serialNumber }
                    ]
                }
            },
        ], { session });
    }

    async addHwNotification(userId: string, hwNotification: HwNotification, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            {
                $push: {
                    hwNotifications: {
                        $each: [hwNotification],
                        $slice: -10
                    }
                }
            },
            { session }
        );
    }

    async deleteHwNotification(userId: string, hwNotificationId: string): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $pull: { hwNotifications: { _id: hwNotificationId } } }
        );
    }
}