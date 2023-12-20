import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../../shared/database';
import { Location } from '../schema';

@Injectable()
export class LocationRepository extends EntityRepository<Location> {
    constructor(@InjectModel(Location.name) model: Model<Location>) {
        super(model);
    }
}