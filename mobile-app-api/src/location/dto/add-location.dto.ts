import { PickType } from '@nestjs/mapped-types';
import { Location } from '../schema';

export class AddLocationReq extends PickType(Location, [
    'name',
    'location',
    'capacity',
    'solarTrackers',
    'weatherStation',
    'cctv'
]) { }