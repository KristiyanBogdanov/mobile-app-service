import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AzureModule } from '../azure/azure.module';
import { UserModule } from '../user/user.module';
import { Product, ProductSchema, Publication, PublicationSchema, Service, ServiceSchema } from './schema';
import { MarketplaceController } from './marketplace.controller';
import { ProductReposiotry, PublicationRepository, ServiceRepository } from './repository';
import { MarketplaceService } from './marketplace.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Publication.name,
                schema: PublicationSchema,
                discriminators: [
                    { name: Product.name, schema: ProductSchema },
                    { name: Service.name, schema: ServiceSchema }
                ]
            }
        ]),
        AzureModule,
        UserModule
    ],
    controllers: [MarketplaceController],
    providers: [
        ProductReposiotry,
        ServiceRepository,
        PublicationRepository,
        MarketplaceService,
    ]
})
export class MarketplaceModule { }