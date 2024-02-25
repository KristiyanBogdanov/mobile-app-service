import { PublicationType } from '../enum';
import { ProductDto } from './product.dto';
import { ServiceDto } from './service.dto';

export class PublicationDto {
    type: PublicationType;
    data: ProductDto | ServiceDto;

    constructor(type: PublicationType, data: ProductDto | ServiceDto) {
        this.type = type;
        this.data = data;
    }
}