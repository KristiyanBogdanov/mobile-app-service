import { PickType } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Location } from '../schema';

export class AddLocationReq extends PickType(Location, [
    'name',
    'weatherStation',
    'cctv'
]) {
    readonly name: Location['name'];
    readonly weatherStation: Location['weatherStation'];
    readonly cctv: Location['cctv'];

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    readonly solarTrackerSerialNumbers: string[];
}