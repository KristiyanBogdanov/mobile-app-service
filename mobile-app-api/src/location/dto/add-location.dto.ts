import { PickType } from '@nestjs/mapped-types';
import { Location } from '../schema';

export class AddLocationReq extends PickType(Location, [
    'name',
    'capacity',
    'solarTrackers',
    'weatherStation',
    'cctv'
]) { }