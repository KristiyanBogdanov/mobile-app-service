import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './shared/guard';
import { LocationModule } from './location/location.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('DATABASE_URI'),
                dbName: configService.get<string>('DATABASE_NAME'),
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UserModule,
        LocationModule
    ],
    providers: [
        {
            provide: 'APP_GUARD',
            useClass: AccessTokenGuard
        }
    ],
})
export class AppModule { }