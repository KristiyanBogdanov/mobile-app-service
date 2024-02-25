import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { Product } from '../schema';

export class ProductReposiotry extends EntityRepository<Product> {
    constructor(@InjectModel(Product.name) productModel: Model<Product>) {
        super(productModel);
    }
}