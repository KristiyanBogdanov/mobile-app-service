import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Document, FilterQuery, Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { User } from '../schema';

@Injectable()
export class UserRepository extends EntityRepository<User> {
    constructor(@InjectModel(User.name) model: Model<User>) {
        super(model);
    }

    async findOne(
        entityFilterQuery: FilterQuery<User>, 
        projection?: Record<string, unknown>,
        options?: Record<string, unknown>
    ): Promise<(User & Document) | null> {
        return await super.findOne(entityFilterQuery, projection, options)
            .then((user) => user?.populate('locations hwNotifications'));
    }

    async updateFcmTokens(userUuid: string, fcmToken: string): Promise<number> {
        return await this.updateOne({ uuid: userUuid }, { $addToSet: { fcmTokens: fcmToken } });
    }

    async addLocation(userUuid: string, locationOid: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { uuid: userUuid },
            { $addToSet: { locations: locationOid } },
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
            }
        ], { session });
    }

    async addHwNotification(userUuid: string, hwNotificationOid: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { uuid: userUuid },
            { $addToSet: { hwNotifications: hwNotificationOid } },
            { session }
        );
    }
}