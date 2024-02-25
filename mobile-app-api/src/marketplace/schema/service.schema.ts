import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { IService } from '../interface';
import { Publication } from './publication.schema';
import { PublicationType, ServiceCategory } from '../enum';

@Exclude()
@Schema()
export class Service extends Publication implements IService {
    @Expose()
    @IsEnum(ServiceCategory)
    @Prop({
        type: String,
        enum: ServiceCategory,
        required: true,
    })
    category: ServiceCategory

    constructor(partial: Partial<Service>) {
        super(partial);
        Object.assign(this, partial);
        this.type = PublicationType.Service;
    }
}

export const ServiceSchema = SchemaFactory.createForClass(Service);