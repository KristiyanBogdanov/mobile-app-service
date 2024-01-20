import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { HwNotification } from '../schema';
import { NotificationStatus } from '../enum';

@Injectable()
export class HwNotificationRepository extends EntityRepository<HwNotification> {
    constructor(@InjectModel(HwNotification.name) model: Model<HwNotification>) {
        super(model);
    }

    async updateStatus(id: string, status: NotificationStatus): Promise<number> {
        return await this.updateOne({ _id: id }, { status });
    }
}