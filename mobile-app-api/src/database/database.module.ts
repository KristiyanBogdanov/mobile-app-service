import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('DATABASE_URI'),
                dbName: configService.get<string>('DATABASE_NAME'),
            }),
            inject: [ConfigService],
        }),
    ]
})
export class DatabaseModule { }