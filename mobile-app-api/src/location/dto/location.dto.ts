import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { Location } from '../schema';

@Exclude()
export class LocationDto extends PickType(Location, [
    'uuid',
    'name',
    'location',
    'capacity',
    'solarTrackers',
    'weatherStation',
    'cctv',
    'sharedWith',
]) {
    amIOwner: boolean;
}