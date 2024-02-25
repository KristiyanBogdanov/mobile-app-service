import { ProductCategory, ProductCondition } from '../enum';
import { IPublication } from './publication.interface';

export interface IProduct extends IPublication {
    condition: ProductCondition;
    category: ProductCategory;
}