import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './shared/guard';
import { LocationModule } from './location/location.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AzureModule } from './azure/azure.module';
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({
            forRoutes: ['*'],
            pinoHttp: {
                customProps: (req, res) => ({
                    context: 'HTTP',
                }),
                transport: {
                    target: 'pino-pretty',
                    options: {
                        singleLine: true,
                    },
                },
            },
        }),
        DatabaseModule,
        AuthModule,
        UserModule,
        LocationModule,
        FirebaseModule,
        AzureModule,
        MarketplaceModule,
        CacheModule.registerAsync(<CacheModuleAsyncOptions>{
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore.redisStore(
                    {
                        url: configService.get<string>('REDIS_URL')
                    }
                )
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        {
            provide: 'APP_GUARD',
            useClass: AccessTokenGuard
        }
    ],
})
export class AppModule { }
