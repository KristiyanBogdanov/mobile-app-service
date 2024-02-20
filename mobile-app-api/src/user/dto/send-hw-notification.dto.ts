import { PickType } from '@nestjs/swagger';
import { HwNotification } from '../schema';

export class SendHwNotificationReq extends PickType(HwNotification, [
    'serialNumber',
    'deviceType',
    'importance',
    'message',
    'advice',
    'timestamp'
]) {
    readonly serialNumber: HwNotification['serialNumber'];
    readonly deviceType: HwNotification['deviceType'];
    readonly importance: HwNotification['importance'];
    readonly message: HwNotification['message'];
    readonly advice: HwNotification['advice'];
    readonly timestamp: HwNotification['timestamp'];
}