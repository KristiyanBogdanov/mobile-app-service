import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ErrorCode } from '../../shared/exception';
import { LOCATION_NAME_MAX_LENGTH, LOCATION_NAME_MIN_LENGTH } from '../../shared/constants';
import { User } from '../../user/schema';
import { ILocation } from '../interface';
import { SolarTracker } from './solar-tracker.schema';

@Exclude()
@Schema({
    collection: 'locations',
    versionKey: false
})
export class Location implements ILocation {
    @Expose()
    id: string;

    @Expose()
    @Prop({
        index: {
            name: 'uuidIndex',
            unique: true
        },
        required: true,
    })
    uuid: string;

    @Expose()
    @IsString()
    @Length(LOCATION_NAME_MIN_LENGTH, LOCATION_NAME_MAX_LENGTH)
    @Prop({ required: true })
    name: string;

    @Expose()
    @Prop({ required: true })
    capacity: number;

    @Expose()
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @Prop({ required: true, min: 1 })
    solarTrackers: string[];

    @Expose()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Prop()
    weatherStation?: string;

    @Expose()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Prop()
    cctv?: string;

    @Expose()
    @Prop({ required: true })
    owner: string;

    @Expose()
    @Prop({
        type: [{ 
            type: MongooseSchema.Types.ObjectId, 
            ref: 'User'
        }],
        min: 1,
        required: true,
    })
    sharedWith: User[];
}

// TODO: try to add constructor with Partial<Location> as parameter, and remove plainToClass from location.service.ts

export const LocationSchema = SchemaFactory.createForClass(Location);
