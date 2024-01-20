import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { ErrorCode } from '../shared/exception';
import { HwNotificationRepository } from './repository';
import { HwNotificationDto, SendHwNotificationReq, UpdateHwNotificationStatusReq } from './dto';
import { HwNotification } from './schema';

@Injectable()
export class HwNotificationService {
    constructor(
        private readonly repository: HwNotificationRepository
    ) { }

    async create(notificationData: SendHwNotificationReq, session: ClientSession): Promise<HwNotification> {
        const hwNotification = new HwNotification(notificationData);
        return await this.repository.createInSession(hwNotification, session);
    }

    mapToHwNotificationDto(hwNotification: HwNotification): HwNotificationDto {
        const hwNotificationDto = plainToClass(HwNotificationDto, hwNotification);
        hwNotificationDto.id = hwNotification._id;

        return hwNotificationDto;
    }

    async markAsSeen(notificationId: string, updateData: UpdateHwNotificationStatusReq): Promise<void> {
        const result = await this.repository.updateStatus(notificationId, updateData.status);

        if (result === 0) {
            throw new InternalServerErrorException(ErrorCode.FailedToUpdateHwNotificationStatus);
        }
    }
}