import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Document, FilterQuery, Model } from 'mongoose';
import { EntityRepository } from '../../shared/database';
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
            .then((user) => user?.populate('locations'));
    }

    async addLocation(userUuid: string, locationOid: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { uuid: userUuid },
            { $addToSet: { locations: locationOid } },
            { session }
        );
    }
}