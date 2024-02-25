import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Document } from 'mongoose';
import { PUBLICATION_TITLE_MAX_LENGTH, PUBLICATION_TITLE_MIN_LENGTH } from '../shared/constants';
import { UserRepository } from '../user/repository';
import { User } from '../user/schema';
import { BriefUserInfo } from '../user/dto';
import { AzureService } from '../azure/azure.service';
import { ProductCategory, ProductCondition, PublicationType, ServiceCategory } from './enum';
import { PostProductReq, GetPublicationLimitsRes, ProductDto, PostServiceReq, ServiceDto, GetPublicationsReqFilters, GetPublicationsRes, PublicationDto } from './dto';
import { Product, Publication, Service } from './schema';
import { ProductReposiotry, PublicationRepository, ServiceRepository } from './repository';
import { Pagination } from './decorator';

@Injectable()
export class MarketplaceService {
    constructor(
        private readonly productRepository: ProductReposiotry,
        private readonly serviceRepository: ServiceRepository,
        private readonly publicationRepository: PublicationRepository,
        private readonly userRepository: UserRepository,
        private readonly azureService: AzureService,
    ) { }

    getPublicationLimits(): GetPublicationLimitsRes {
        return {
            tileMinLength: PUBLICATION_TITLE_MIN_LENGTH,
            titleMaxLength: PUBLICATION_TITLE_MAX_LENGTH,
            productConditionOptions: Object.values(ProductCondition),
            productCategories: Object.values(ProductCategory),
            serviceCategories: Object.values(ServiceCategory)
        }
    }

    private mapToProductDto(userId: string, product: Publication, user: User): ProductDto {
        const productDto = plainToClass(ProductDto, product);
        productDto.publisher = plainToClass(BriefUserInfo, user);
        productDto.amIPublisher = userId === user.id;

        return productDto;
    }

    private mapToServiceDto(userId: string, service: Publication, user: User): ServiceDto {
        const serviceDto = plainToClass(ServiceDto, service);
        serviceDto.publisher = plainToClass(BriefUserInfo, user);
        serviceDto.amIPublisher = userId === user.id;

        return serviceDto;
    }

    async mapToPublicationDto(userId: string, publication: Publication & Document): Promise<PublicationDto> {
        await publication.populate('publisher');

        return new PublicationDto(
            publication.type,
            publication.type === PublicationType.Product
                ? this.mapToProductDto(userId, publication, publication.publisher)
                : this.mapToServiceDto(userId, publication, publication.publisher)
        );
    }

    async postProduct(userId: string, images: Express.Multer.File[], productData: PostProductReq): Promise<ProductDto> {
        if (!images) {
            throw new BadRequestException();
        }

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        const imagesUrls = await Promise.all(
            images.map(image => this.azureService.uploadFile('fileupload', image))
        );

        const product = new Product({
            ...productData,
            images: imagesUrls,
            publisher: user,
        });

        const savedProduct = await this.productRepository.create(product);

        return this.mapToProductDto(userId, savedProduct, user);
    }

    async postService(userId: string, images: Express.Multer.File[], serviceData: PostServiceReq): Promise<ServiceDto> {
        if (!images) {
            throw new BadRequestException();
        }

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        const imagesUrls = await Promise.all(
            images.map(image => this.azureService.uploadFile('fileupload', image))
        );

        const service = new Service({
            ...serviceData,
            images: imagesUrls,
            publisher: user,
        });

        const savedService = await this.serviceRepository.create(service);

        return this.mapToServiceDto(userId, savedService, user);
    }

    async getPublications(userId: string, pagination: Pagination, filters: GetPublicationsReqFilters): Promise<GetPublicationsRes> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        const productCategories = filters.productCategories || Object.values(ProductCategory);
        const serviceCategories = filters.serviceCategories || Object.values(ServiceCategory);

        const publications = await this.publicationRepository.findPublications(pagination, { productCategories, serviceCategories });

        const publicationsDto = await Promise.all(
            publications.map(async publication => {
                return this.mapToPublicationDto(userId, publication);
            })
        )

        return new GetPublicationsRes(publicationsDto.length, publicationsDto, pagination.page, pagination.limit);
    }

    async deletePublication(userId: string, publicationId: string): Promise<void> {
        const publication = await (await this.publicationRepository.findById(publicationId)).populate('publisher');

        if (!publication) {
            throw new NotFoundException();
        }

        if (publication.publisher.id !== userId) {
            throw new ForbiddenException();
        }

        await this.publicationRepository.deleteById(publicationId);

        publication.images.forEach(async imageUrl => {
            this.azureService.deleteFile('fileupload', imageUrl);
        });
    }
}