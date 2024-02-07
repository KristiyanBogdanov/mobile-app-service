import { Schema } from '@nestjs/mongoose';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ISolarTracker } from '../interface';

@Schema({ _id: false })
export class SolarTracker implements ISolarTracker {
    @IsString()
    @IsNotEmpty()
    serialNumber: string;

    @IsPositive()
    capacity: number;
}