import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../user/schema';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../type';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET')
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		return await this.authService.validatePayload(payload);
	}
}