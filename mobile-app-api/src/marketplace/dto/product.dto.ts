import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BriefUserInfo } from '../../user/dto';
import { Product } from '../schema';

@Exclude()
export class ProductDto extends PickType(Product, [
    'id',
    'title',
    'description',
    'images',
    'pricingOption',
    'price',
    'condition',
    'category',
    'createdAt'
]) {
    amIPublisher: boolean;
    publisher: BriefUserInfo;
}