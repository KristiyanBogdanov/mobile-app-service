import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class SignInReq {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

@Exclude()
export class SignInRes {
    @Expose()
    uuid: string;

    @Expose()
    username: string;

    accessToken: string;
}