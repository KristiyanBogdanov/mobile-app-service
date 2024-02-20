import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { HwApi } from '../shared/api';
import { FirebaseModule } from '../firebase/firebase.module';
import { Location, LocationSchema } from './schema';
import { LocationRepository } from './repository';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Location.name, schema: LocationSchema },
        ]),
        HttpModule,
        FirebaseModule
    ],
    controllers: [LocationController],
    providers: [
        LocationService,
        LocationRepository,
        HwApi
    ],
    exports: [
        LocationService,
        LocationRepository
    ]
})
export class LocationModule { }