import { JwtPayload } from './jwt-payload.type';

export type JwtRefresh = {
    jwtPayload: JwtPayload;
    refreshToken: string;
};