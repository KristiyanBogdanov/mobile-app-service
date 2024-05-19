import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { createHash } from 'crypto';
import { PUBLICATIONS_FETCH_CACHE_PREFIX } from '../shared/constants';
import { JwtPayload } from '../auth/type';
import { MarketplaceService } from './marketplace.service';
import { PostProductReq, GetPublicationLimitsRes, ProductDto, PostServiceReq, ServiceDto, GetPublicationsReqFilters, GetPublicationsRes } from './dto';
import { Pagination, PaginationParams } from './decorator';

@Controller('marketplace-publications')
export class MarketplaceController {
    constructor(private readonly marketplaceService: MarketplaceService) { }

    @Get('/limits')
    getPublicationLimits(): GetPublicationLimitsRes {
        return this.marketplaceService.getPublicationLimits();
    }

    @UseInterceptors(FilesInterceptor('images'))
    @Post('/products')
    async postProduct(@Req() request: Request, @UploadedFiles() images: Express.Multer.File[], @Body() productData: PostProductReq): Promise<ProductDto> {
        const payload = request.user as JwtPayload;
        return await this.marketplaceService.postProduct(payload.id, images, productData);
    }

    @UseInterceptors(FilesInterceptor('images'))
    @Post('/services')
    async postService(@Req() request: Request, @UploadedFiles() images: Express.Multer.File[], @Body() serviceData: PostServiceReq): Promise<ServiceDto> {
        const payload = request.user as JwtPayload;
        return await this.marketplaceService.postService(payload.id, images, serviceData);
    }

    @Get('/')
    async getPublications(@Req() request: Request, @PaginationParams() paginationParams: Pagination, @Body() filters: GetPublicationsReqFilters): Promise<GetPublicationsRes> {
        const cacheKey = PUBLICATIONS_FETCH_CACHE_PREFIX + createHash('sha256').update(request['originalUrl'] + JSON.stringify(request.body)).digest('hex');
        const payload = request.user as JwtPayload;
        return await this.marketplaceService.getPublications(payload.id, paginationParams, filters, cacheKey);
    }

    @Delete('/:publicationId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePublication(@Req() request: Request, @Param('publicationId') publicationId: string): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.marketplaceService.deletePublication(payload.id, publicationId);
    }
}