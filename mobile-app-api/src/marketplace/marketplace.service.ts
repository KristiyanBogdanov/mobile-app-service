import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import { plainToClass } from 'class-transformer';
import { Document } from 'mongoose';
import { PUBLICATION_TITLE_MAX_LENGTH, PUBLICATION_TITLE_MIN_LENGTH, PUBLICATIONS_FETCH_CACHE_PREFIX, PUBLICATIONS_FETCH_CACHE_TTL } from '../shared/constants';
import { UserRepository } from '../user/repository';
import { User } from '../user/schema';
import { BriefUserInfo } from '../user/dto';
import { AzureService } from '../azure/azure.service';
import { PublicationType } from './enum';
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
        @Inject(CACHE_MANAGER) private readonly cacheService: Cache
    ) { }

    getPublicationLimits(): GetPublicationLimitsRes {
        return {
            tileMinLength: PUBLICATION_TITLE_MIN_LENGTH,
            titleMaxLength: PUBLICATION_TITLE_MAX_LENGTH,
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

    async mapToPublicationDto(userId: string, publication: Publication & Document, populate = true): Promise<PublicationDto> {
        if (populate) {
            await publication.populate('publisher');
        }

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

        const [imagesUrls] = await Promise.all([
            Promise.all(images.map(image => this.azureService.uploadFile('fileupload', image))),
            this.deleteCachedPublications()
        ]);
        
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

        const [imagesUrls] = await Promise.all([
            Promise.all(images.map(image => this.azureService.uploadFile('fileupload', image))),
            this.deleteCachedPublications()
        ]);

        const service = new Service({
            ...serviceData,
            images: imagesUrls,
            publisher: user,
        });

        const savedService = await this.serviceRepository.create(service);

        return this.mapToServiceDto(userId, savedService, user);
    }

    async getPublications(userId: string, pagination: Pagination, filters: GetPublicationsReqFilters, cacheKey: string): Promise<GetPublicationsRes> {    
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        const cacheStore = this.getCacheStore();
        let publications = await cacheStore.get(cacheKey, null, null);

        if (!publications) {
            const productCategories = filters.productCategories || [];
            const serviceCategories = filters.serviceCategories || [];

            publications = await this.publicationRepository.findPublications(pagination, { productCategories, serviceCategories });
            await Promise.all(
                publications.map(async publication => {
                    return publication.populate('publisher');
                })
            );

            await cacheStore.set(
                cacheKey, 
                publications.map(publication => publication.toObject()),
                { ttl: PUBLICATIONS_FETCH_CACHE_TTL }, 
                null
            );
        }

        const publicationsDto = await Promise.all(
            publications.map(async publication => {
                return this.mapToPublicationDto(userId, publication, false);
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

        await Promise.all([
            this.deleteCachedPublications(),
            this.publicationRepository.deleteById(publicationId)
        ]);

        publication.images.forEach(async imageUrl => {
            this.azureService.deleteFile('fileupload', imageUrl);
        });
    }

    private getCacheStore(): RedisStore {
        return this.cacheService.store as unknown as RedisStore;
    }

    private async deleteCachedPublications() {
        const cacheStore = this.getCacheStore();
        const cachedKeys = await cacheStore.keys(PUBLICATIONS_FETCH_CACHE_PREFIX + '*', null);
        await cacheStore.mdel(...cachedKeys);
    }
}