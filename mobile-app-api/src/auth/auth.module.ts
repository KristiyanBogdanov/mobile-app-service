import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategy';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';

@Module({
    imports: [
        JwtModule.register({}),
        PassportModule,
        UserModule,
        LocationModule
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AccessTokenStrategy,
    ],
})
export class AuthModule { }