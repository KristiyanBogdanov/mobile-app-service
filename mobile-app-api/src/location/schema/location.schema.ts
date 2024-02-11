import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
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
    @IsString()
    @Length(LOCATION_NAME_MIN_LENGTH, LOCATION_NAME_MAX_LENGTH)
    @Prop({ required: true })
    name: string;
    
    @Expose()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested()
    @Type(() => SolarTracker)
    @Prop({
        type: [SolarTracker],
        required: true,
    })
    solarTrackers: SolarTracker[];

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

    constructor(partial: Partial<Location>) {
        Object.assign(this, partial);
    }
}

export const LocationSchema = SchemaFactory.createForClass(Location);
