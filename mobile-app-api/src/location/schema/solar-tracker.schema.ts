import { Prop, Schema } from '@nestjs/mongoose';
import { IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ISolarTracker } from '../interface';

@Exclude()
@Schema({ 
    versionKey: false,
})
export class SolarTracker implements ISolarTracker {
    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    serialNumber: string;

    @Expose()
    @IsPositive()
    @Prop({ required: true })
    capacity: number;
}