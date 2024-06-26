import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClientSession } from 'mongoose';
import { PASSWORD_MAX_LENGTH, STRONG_PASSWORD_OPTIONS, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../shared/constants';
import { User } from '../user/schema';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/repository';
import { GetAuthLimitsRes, RefreshTokensRes, SignInReq, SignInRes, SignUpReq } from './dto';
import { JwtPayload } from './type';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    getLimits(): GetAuthLimitsRes {
        return {
            usernameMinLength: USERNAME_MIN_LENGTH,
            usernameMaxLength: USERNAME_MAX_LENGTH,
            passwordMinLength: STRONG_PASSWORD_OPTIONS.minLength,
            passwordMaxLength: PASSWORD_MAX_LENGTH,
            passwordMinNumbers: STRONG_PASSWORD_OPTIONS.minNumbers,
            passwordMinLowercase: STRONG_PASSWORD_OPTIONS.minLowercase,
            passwordMinUppercase: STRONG_PASSWORD_OPTIONS.minUppercase,
        };
    }

    private async hashData(data: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(data, salt);
    }

    private async generateTokens(jwtPayload: JwtPayload): Promise<{ accessToken: string, refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
                expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN'),
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
                expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async updateRefreshToken(userId: string, refreshToken: string, session?: ClientSession): Promise<void> {
        const hashedRefreshToken = await this.hashData(refreshToken);
        const result = await this.userRepository.updateRefreshToken(userId, hashedRefreshToken, session);

        if (result === 0) {
            throw new InternalServerErrorException();
        }
    }

    async signup(sigupData: SignUpReq): Promise<SignInRes> {
        const user = new User(sigupData);
        user.password = await this.hashData(user.password);
        user.fcmTokens = [sigupData.fcmToken];

        const session = await this.userRepository.startSession();
        session.startTransaction();

        try {
            const createdUser = await this.userService.create(user, session);
            const userDto = await this.userService.mapToUserDto(createdUser);

            const { accessToken, refreshToken } = await this.generateTokens({ id: createdUser.id, fcmToken: sigupData.fcmToken });
            await this.updateRefreshToken(createdUser.id, refreshToken, session);

            await session.commitTransaction();

            return new SignInRes({
                ...userDto,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async signin(signinData: SignInReq): Promise<SignInRes> {
        const user = await this.userRepository.findOne({ email: signinData.email });

        if (!user) {
            throw new UnauthorizedException();
        }

        const isPasswordValid = await bcrypt.compare(signinData.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException();
        }

        const tokens = await this.generateTokens({ id: user.id, fcmToken: signinData.fcmToken });

        user.refreshToken = await this.hashData(tokens.refreshToken);
        user.fcmTokens = Array.from(new Set([...user.fcmTokens, signinData.fcmToken]));

        await user.save();

        const userDto = await this.userService.mapToUserDto(user);

        return new SignInRes({
            ...userDto,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    }

    async signout(userId: string, fcmToken: string): Promise<void> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        if (user.fcmTokens.length === 1) {
            user.refreshToken = null;
        }

        user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken);

        await user.save();
    }

    async refreshTokens(userId: string, fcmToken: string, refreshToken: string): Promise<RefreshTokensRes> {
        const user = await this.userRepository.findById(userId);

        if (!user || !user.refreshToken) {
            throw new ForbiddenException();
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

        if (!isRefreshTokenValid) {
            throw new ForbiddenException();
        }

        const tokens = await this.generateTokens({ id: user.id, fcmToken });
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }
}