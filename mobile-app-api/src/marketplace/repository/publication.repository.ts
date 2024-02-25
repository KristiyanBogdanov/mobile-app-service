import { InjectModel } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { EntityRepository } from '../../database';
import { Publication } from '../schema';
import { Pagination } from '../decorator';
import { GetPublicationsReqFilters } from '../dto';
import { PublicationType } from '../enum';

export class PublicationRepository extends EntityRepository<Publication> {
    constructor(@InjectModel(Publication.name) publicationModel: Model<Publication>) {
        super(publicationModel);
    }

    async findPublications(pagination: Pagination, filters: GetPublicationsReqFilters): Promise<(Publication & Document)[]> {
        return await this.find(
            {
                $or: [
                    {
                        type: PublicationType.Product,
                        category: { $in: filters.productCategories }
                    },
                    {
                        type: PublicationType.Service,
                        category: { $in: filters.serviceCategories }
                    }
                ]
            },
            {},
            {
                skip: pagination.offset,
                limit: pagination.limit,
                sort: { createdAt: -1 }
            }
        );
    }
}