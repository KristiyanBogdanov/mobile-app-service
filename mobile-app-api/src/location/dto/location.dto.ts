import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BriefUserInfo } from '../../user/dto';
import { Location } from '../schema';

@Exclude()
export class LocationDto extends PickType(Location, [
    'id',
    'name',
    'solarTrackers',
    'weatherStation',
    'cctv',
]) {
    sharedWith: BriefUserInfo[];
    amIOwner: boolean;
}