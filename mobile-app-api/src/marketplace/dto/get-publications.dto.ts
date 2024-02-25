import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { ProductCategory, ServiceCategory } from '../enum';
import { PublicationDto } from './publication.dto';

export class GetPublicationsReqFilters {
    @IsOptional()
    @IsArray()
    @IsEnum(ProductCategory, { each: true })
    readonly productCategories: ReadonlyArray<ProductCategory>;

    @IsOptional()
    @IsArray()
    @IsEnum(ServiceCategory, { each: true })
    readonly serviceCategories: ReadonlyArray<ServiceCategory>;
}

export class GetPublicationsRes {
    totalItems: number;
    items: PublicationDto[];
    page: number;
    limit: number;

    constructor(totalItems: number, items: PublicationDto[], page: number, limit: number) {
        this.totalItems = totalItems;
        this.items = items;
        this.page = page;
        this.limit = limit;
    }
}