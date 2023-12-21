import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../../shared/database';
import { User } from '../schema';

@Injectable()
export class UserRepository extends EntityRepository<User> {
    constructor(@InjectModel(User.name) model: Model<User>) {
        super(model);
    }

    async addLocation(userUuid: string, locationUuid: string): Promise<number> {
        return await this.updateOne(
            { uuid: userUuid },
            { $addToSet: { locations: locationUuid } }
        );
    }
}