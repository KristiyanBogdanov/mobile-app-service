import { PickType } from '@nestjs/mapped-types';
import { HwNotification } from '../schema';
import { Exclude } from 'class-transformer';

@Exclude()
export class HwNotificationDto extends PickType(HwNotification, [
    'notificationType',
    'serialNumber',
    'deviceType',
    'importance',
    'message',
    'timestamp',
    'status'
]) { 
    id: string;
}