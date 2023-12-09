import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        JwtModule.register({}),
        PassportModule,
        UserModule
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AccessTokenStrategy,
    ],
})
export class AuthModule { }