import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload, JwtRefresh } from '../type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
            passReqToCallback: true,
        });
    }

    validate(request: Request, payload: JwtPayload): JwtRefresh {
        const refreshToken = request.get('Authorization').replace('Bearer', '').trim();
        return { jwtPayload: payload, refreshToken };
    }
}