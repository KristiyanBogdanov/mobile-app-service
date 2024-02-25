import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { Service } from '../schema';

export class ServiceRepository extends EntityRepository<Service> {
    constructor(@InjectModel(Service.name) serviceModel: Model<Service>) {
        super(serviceModel);
    }
}