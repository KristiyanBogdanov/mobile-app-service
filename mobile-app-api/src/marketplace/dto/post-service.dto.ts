import { PickType } from '@nestjs/swagger';
import { Service } from '../schema';

export class PostServiceReq extends PickType(Service, [
    'title',
    'description',
    'pricingOption',
    'price',
    'category',
]) {
    readonly title: Service['title'];
    readonly description: Service['description'];
    readonly pricingOption: Service['pricingOption'];
    readonly price: Service['price'];
    readonly category: Service['category'];
}