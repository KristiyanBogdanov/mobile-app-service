import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { HwNotification } from '../schema';

@Exclude()
export class HwNotificationDto extends PickType(HwNotification, [
    'id',
    'notificationType',
    'serialNumber',
    'deviceType',
    'importance',
    'message',
    'advice',
    'timestamp',
]) { }