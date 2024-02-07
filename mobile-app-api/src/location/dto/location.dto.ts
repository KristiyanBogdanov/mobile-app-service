import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { BriefUserInfo } from '../../user/dto';
import { Location } from '../schema';

@Exclude()
export class LocationDto extends PickType(Location, [
    'id',
    'uuid',
    'name',
    'capacity',
    'solarTrackers',
    'weatherStation',
    'cctv',
]) {
    sharedWith: BriefUserInfo[];
    amIOwner: boolean;
}