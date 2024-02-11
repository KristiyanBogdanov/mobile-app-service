import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import { UserDto } from '../../user/dto';

export class SignInReq {
    @IsEmail()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly fcmToken: string;
}

@Exclude()
export class SignInRes extends UserDto {
    accessToken: string;
    refreshToken: string;

    constructor(userDto: Partial<SignInRes>) {
        super();
        Object.assign(this, userDto);
    }
}