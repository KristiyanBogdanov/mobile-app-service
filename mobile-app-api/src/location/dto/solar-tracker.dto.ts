import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { SolarTracker } from '../schema';

@Exclude()
export class SolarTrackerDto extends PickType(SolarTracker, [
    'serialNumber',
    'capacity',
]) { }