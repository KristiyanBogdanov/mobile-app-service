import { PickType } from '@nestjs/mapped-types';
import { HwNotification } from '../schema';

export class UpdateHwNotificationStatusReq extends PickType(HwNotification, [
    'status'
]) { }