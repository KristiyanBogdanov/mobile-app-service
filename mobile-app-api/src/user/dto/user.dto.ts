import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { LocationDto } from '../../location/dto';
import { HwNotificationDto } from '../../hw-notification/dto';
import { User } from '../schema';

@Exclude()
export class UserDto extends PickType(User, [
    'uuid',
    'username',
    'email',
]) {
    locations: LocationDto[];
    hwNotifications: HwNotificationDto[];
}