import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { Location, LocationSchema } from './schema';
import { LocationRepository } from './repository';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Location.name, schema: LocationSchema },
        ]),
        UserModule,
        HttpModule
    ],
    controllers: [LocationController],
    providers: [
        LocationService,
        LocationRepository
    ],
})
export class LocationModule { }