import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { PUBLICATION_TITLE_MAX_LENGTH, PUBLICATION_TITLE_MIN_LENGTH } from '../../shared/constants';
import { User } from '../../user/schema';
import { IPublication } from '../interface';
import { PricingOption, PublicationType } from '../enum';

@Exclude()
@Schema({
    collection: 'marketplace-publications',
    versionKey: false
})
export class Publication implements IPublication  {
    @Expose()
    id: string;

    @Expose()
    @Prop({
        type: String,
        enum: PublicationType,
        required: true,
    })
    type: PublicationType;

    @Expose()
    @IsString()
    @Length(PUBLICATION_TITLE_MIN_LENGTH, PUBLICATION_TITLE_MAX_LENGTH)
    @Prop({ required: true })
    title: string;
    
    @Expose()
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    description: string;

    @Expose()
    @Prop({ 
        type: [String], 
        default: [],
        required: true 
    })
    images: string[];

    @Expose()
    @IsEnum(PricingOption)
    @Prop({
        type: String,
        enum: PricingOption,
        required: true,
    })
    pricingOption: PricingOption;

    @Expose()
    @IsOptional()
    @IsNumberString()
    @Prop()
    price: number;

    @Expose()
    @Prop({ required: true })
    createdAt: Date;

    @Expose()
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true,
    })
    publisher: User;

    constructor(partial: Partial<Publication>) {
        Object.assign(this, partial);
        this.createdAt = new Date();
    }
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);