import { ServiceCategory } from '../enum';
import { IPublication } from './publication.interface';

export interface IService extends IPublication {
    category: ServiceCategory;
}