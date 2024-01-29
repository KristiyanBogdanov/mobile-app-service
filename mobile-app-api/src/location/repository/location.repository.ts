import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { BriefUserInfo } from '../../user/schema';
import { Location } from '../schema';

@Injectable()
export class LocationRepository extends EntityRepository<Location> {
    constructor(@InjectModel(Location.name) model: Model<Location>) {
        super(model);
    }

    async shareWith(briefUser: BriefUserInfo, locationId: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: locationId },
            { $addToSet: { sharedWith: briefUser } },
            { session }
        );
    }
}