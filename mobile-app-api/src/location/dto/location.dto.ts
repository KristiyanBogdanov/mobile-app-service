import { PickType } from '@nestjs/mapped-types';
import { Exclude, Expose } from 'class-transformer';
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
    'sharedWith'
]) {
    @Expose() 
    amIOwner: boolean;
}