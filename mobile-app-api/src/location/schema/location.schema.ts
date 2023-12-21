import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { LOCATION_NAME_MAX_LENGTH } from '../../shared/constants';
import { ILocation } from '../interface';

@Exclude()
@Schema({
    collection: 'locations',
})
export class Location implements ILocation {
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
    @MaxLength(LOCATION_NAME_MAX_LENGTH, { message: 'location name is too long' })
    @Prop({ required: true })
    name: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    location: string;

    @Expose()
    @IsPositive()
    @Prop({ required: true })
    capacity: number;

    // TODO: test this with array of numbers
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
    weatherStation: string;

    @Expose()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Prop()
    cctv: string;

    @Expose()
    @Prop({ required: true })
    owner: string;

    @Expose()
    @Prop({ required: true, min: 1 })
    sharedWith: string[];
}

export const LocationSchema = SchemaFactory.createForClass(Location);