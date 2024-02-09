import { PickType } from '@nestjs/mapped-types';
import { HwNotification } from '../schema';

export class SendHwNotificationReq extends PickType(HwNotification, [
    'serialNumber',
    'deviceType',
    'importance',
    'message',
    'advice',
    'timestamp'
]) { }