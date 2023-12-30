import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { EntityRepository } from '../../shared/database';
import { BriefUserInfo } from '../../user/schema';
import { Location } from '../schema';

@Injectable()
export class LocationRepository extends EntityRepository<Location> {
    constructor(@InjectModel(Location.name) model: Model<Location>) {
        super(model);
    }

    async findAllWithUuidIn(uuids: string[]): Promise<Location[]> {
        return await this.find({ uuid: { $in: uuids } });
    }

    async shareWith(briefUser: BriefUserInfo, locationUuid: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { uuid: locationUuid },
            { $addToSet: { sharedWith: briefUser } },
            { session }
        );
    }
}