import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Document, Model, Types } from 'mongoose';
import { EntityRepository } from '../../database';
import { HwNotification, User } from '../schema';
import { NotificationStatus } from '../enum';

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

    async updateFcmTokens(userId: string, fcmToken: string): Promise<number> {
        return await this.updateOne(
            { _id: userId }, 
            { $addToSet: { fcmTokens: fcmToken } }
        );
    }

    async addLocation(userId: string, locationId: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $addToSet: { locations: locationId } },
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
                        { 'locations.solarTrackers': serialNumber },
                        { 'locations.weatherStation': serialNumber }
                    ]
                }
            },
        ], { session });
    }

    async addHwNotification(userId: string, hwNotification: HwNotification, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: userId },
            { $addToSet: { hwNotifications: hwNotification } },
            { session }
        );
    }

    async updateHwNotificationStatus(userId: string, hwNotificationId: string, status: NotificationStatus): Promise<number> {
        return await this.updateOne(
            { _id: userId, 'hwNotifications._id': hwNotificationId },
            { $set: { 'hwNotifications.$.status': status } }
        );
    }

    async deleteHwNotification(userId: string, hwNotificationId: string): Promise<number> {
      return await this.updateOne(
            { _id: userId },
            { $pull: { hwNotifications: { _id: hwNotificationId } } }
        );
    }
}