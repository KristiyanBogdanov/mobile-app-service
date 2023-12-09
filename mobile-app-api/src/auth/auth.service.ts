import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
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

    private async generateAccessToken(uuid: string): Promise<string> {
        const jwtPayload: JwtPayload = { sub: uuid };

        return await this.jwtService.signAsync(jwtPayload, {
            secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
        });
    }

    async signup(sigupData: SignUpReq): Promise<SignInRes> {
        const user = plainToClass(User, sigupData);
        user.uuid = uuidv4();
        user.password = await this.hashPassword(user.password);

        const savedUser = await this.userService.create(user);
        const accessToken = await this.generateAccessToken(savedUser.uuid);
        
        const response = plainToClass(SignInRes, savedUser);
        response.accessToken = accessToken;

        return response;
    }

    async signin(signinData: SignInReq): Promise<SignInRes> {
        const user = await this.userService.findByEmail(signinData.email);

        if (!user) {
            throw new UnauthorizedException('Invalid email');
        }

        const isPasswordValid = await bcrypt.compare(signinData.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const accessToken = await this.generateAccessToken(user.uuid);

        const response = plainToClass(SignInRes, user);
        response.accessToken = accessToken;

        return response;
    }

    async validatePayload(payload: JwtPayload): Promise<User> {
        const user = await this.userService.findByUuid(payload.sub);

        if (!user || user.uuid !== payload.sub) {
            throw new UnauthorizedException('Invalid token');
        }

        return plainToClass(User, user.toObject());
    }
}