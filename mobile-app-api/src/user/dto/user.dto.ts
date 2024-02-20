import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { LocationDto } from '../../location/dto';
import { User } from '../schema';
import { HwNotificationDto } from './hw-notification.dto';
import { InvitationDto } from './invitation.dto';

@Exclude()
export class UserDto extends PickType(User, [
    'id',
    'username',
    'email',
]) {
    locations: LocationDto[];
    hwNotifications: HwNotificationDto[];
    invitations: InvitationDto[];
}