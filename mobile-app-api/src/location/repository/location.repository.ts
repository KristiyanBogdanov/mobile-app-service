import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Document, Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { Location } from '../schema';

@Injectable()
export class LocationRepository extends EntityRepository<Location> {
    constructor(@InjectModel(Location.name) model: Model<Location>) {
        super(model);
    }

    async findById(
        entityId: string, 
        projection?: Record<string, unknown>,
        options?: Record<string, unknown>
    ): Promise<(Location & Document) | null> {
        return await this.entityModel.findById(entityId, projection, options)
            .then((location) => location?.populate('sharedWith'));
    }

    async shareWith(userId: string, locationId: string, session: ClientSession): Promise<number> {
        return await this.updateOne(
            { _id: locationId },
            { $addToSet: { sharedWith: userId } },
            { session }
        );
    }
}