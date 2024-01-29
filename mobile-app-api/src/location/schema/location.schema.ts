import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { ErrorCode } from '../../shared/exception';
import { LOCATION_NAME_MAX_LENGTH, LOCATION_NAME_MIN_LENGTH } from '../../shared/constants';
import { BriefUserInfo } from '../../user/schema';
import { ILocation } from '../interface';

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
    @Length(
        LOCATION_NAME_MIN_LENGTH, LOCATION_NAME_MAX_LENGTH, 
        { context: { errorCode: ErrorCode.InvalidLocationNameLength } }
    )
    @Prop({ required: true })
    name: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    location: string;

    @Expose()
    @IsPositive()
    @IsInt()
    @Prop({ required: true })
    capacity: number;

    // TODO: test this with array of numbers
    @Expose()
    @IsArray()
    @ArrayMinSize(
        1, { context: { errorCode: ErrorCode.SolarTrackersArrayMustContainAtLeastOneSerialNumber } }
    )
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
    @Type(() => BriefUserInfo)
    @Prop({ required: true, min: 1 })
    sharedWith: BriefUserInfo[];
}

// TODO: try to add constructor with Partial<Location> as parameter, and remove plainToClass from location.service.ts

export const LocationSchema = SchemaFactory.createForClass(Location);
