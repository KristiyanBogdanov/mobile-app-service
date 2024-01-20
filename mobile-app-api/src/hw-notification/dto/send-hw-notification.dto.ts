import { PickType } from '@nestjs/mapped-types';
import { HwNotification } from '../schema';

export class SendHwNotificationReq extends PickType(HwNotification, [
    'notificationType',
    'serialNumber',
    'deviceType',
    'importance',
    'message',
    'timestamp'
]) { }