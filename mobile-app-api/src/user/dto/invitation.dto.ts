import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Invitation } from '../schema';

@Exclude()
export class InvitationDto extends PickType(Invitation, [
    'id',
    'locationId',
    'locationName',
    'ownerUsername',
    'timestamp'
]) { }