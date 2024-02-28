import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthNotRequired } from '../shared/decorator';
import { RefreshTokenGuard } from '../shared/guard';
import { AuthService } from './auth.service';
import { GetAuthLimitsRes, RefreshTokensRes, SignInReq, SignInRes, SignUpReq } from './dto';
import { JwtPayload, JwtRefresh } from './type';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @AuthNotRequired()
    @Get('/limits')
    getLimits(): GetAuthLimitsRes {
        return this.authService.getLimits();
    }

    @AuthNotRequired()
    @Post('/signup')
    async signup(@Body() signupData: SignUpReq): Promise<SignInRes> {
        return await this.authService.signup(signupData);
    }

    @AuthNotRequired()
    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    async signin(@Body() signinData: SignInReq): Promise<SignInRes> {
        return await this.authService.signin(signinData);
    }

    @Get('/signout')
    async signout(@Req() request: Request): Promise<void> {
        const payload = request.user as JwtPayload;
        return await this.authService.signout(payload.id, payload.fcmToken);
    }

    @UseGuards(RefreshTokenGuard)
    @Get('/refresh')
    async refreshTokens(@Req() request: Request): Promise<RefreshTokensRes> {
        const payload = request.user as JwtRefresh
        return await this.authService.refreshTokens(payload.jwtPayload.id, payload.jwtPayload.fcmToken, payload.refreshToken);
    }
}