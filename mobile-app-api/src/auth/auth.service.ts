import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from '../shared/exception';
import { User } from '../user/schema';
import { UserService } from '../user/user.service';
import { SignInReq, SignInRes, SignUpReq } from './dto';
import { JwtPayload } from './type';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }

    private async generateAccessToken(jwtPayload: JwtPayload): Promise<string> {
        return await this.jwtService.signAsync(jwtPayload, {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        });
    }

    async signup(sigupData: SignUpReq): Promise<SignInRes> {
        const user = new User(sigupData);
        user.uuid = uuidv4();
        user.password = await this.hashPassword(user.password);
        user.fcmTokens = [sigupData.fcmToken];

        const createdUser = await this.userService.create(user);
        const userDto = this.userService.mapToUserDto(createdUser);

        return new SignInRes({
            ...userDto,
            accessToken: await this.generateAccessToken({ sub: createdUser.uuid })
        });
    }

    async signin(signinData: SignInReq): Promise<SignInRes> {
        const user = await this.userService.findByEmail(signinData.email);

        if (!user) {
            throw new UnauthorizedException(ErrorCode.InvalidEmail);
        }

        const isPasswordValid = await bcrypt.compare(signinData.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException(ErrorCode.InvalidPassword);
        }

        this.userService.updateFcmTokens(user.uuid, signinData.fcmToken);
        const userDto = this.userService.mapToUserDto(user);
        
        return new SignInRes({
            ...userDto,
            accessToken: await this.generateAccessToken({ sub: user.uuid })
        });
    }
}