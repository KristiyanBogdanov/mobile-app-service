import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_NOT_REQUIRED } from '../decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isAuthNotRequired = this.reflector.getAllAndOverride(AUTH_NOT_REQUIRED, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isAuthNotRequired) {
            return true;
        }

        const isRefreshToken = context.switchToHttp().getRequest().url.includes('auth/refresh');

        if (isRefreshToken) {
            return true;
        }

        return super.canActivate(context);
    }
}