import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { IProduct } from '../interface';
import { Publication } from './publication.schema';
import { ProductCategory, ProductCondition, PublicationType } from '../enum';

@Exclude()
@Schema()
export class Product extends Publication implements IProduct {
    @Expose()
    @IsEnum(ProductCondition)
    @Prop({
        type: String,
        enum: ProductCondition,
        required: true,
    })
    condition: ProductCondition;

    @Expose()
    @IsEnum(ProductCategory)
    @Prop({
        type: String,
        enum: ProductCategory,
        required: true,
    })
    category: ProductCategory;

    constructor(partial: Partial<Product>) {
        super(partial);
        Object.assign(this, partial);
        this.type = PublicationType.Product;
    }
}

export const ProductSchema = SchemaFactory.createForClass(Product);