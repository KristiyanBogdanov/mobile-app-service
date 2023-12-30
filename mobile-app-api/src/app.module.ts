import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './shared/guard';
import { LocationModule } from './location/location.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
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