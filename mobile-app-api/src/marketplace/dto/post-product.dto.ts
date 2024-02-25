import { PickType } from '@nestjs/swagger';
import { Product } from '../schema';

export class PostProductReq extends PickType(Product, [
    'title',
    'description',
    'pricingOption',
    'price',
    'condition',
    'category',
]) {
    readonly title: Product['title'];
    readonly description: Product['description'];
    readonly pricingOption: Product['pricingOption'];
    readonly price: Product['price'];
    readonly condition: Product['condition'];
    readonly category: Product['category'];
}