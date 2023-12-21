import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthNotRequired } from '../shared/decorator';
import { AuthService } from './auth.service';
import { SignInReq, SignInRes, SignUpReq } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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
}