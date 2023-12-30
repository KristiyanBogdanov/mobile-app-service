import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Exclude } from 'class-transformer';
import { UserDto } from '../../user/dto';

export class SignInReq {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

@Exclude()
export class SignInRes extends UserDto {
    accessToken: string;

    constructor(userDto: Partial<SignInRes>) {
        super();
        Object.assign(this, userDto);
    }
}