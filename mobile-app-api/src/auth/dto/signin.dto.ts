import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { LocationDto } from '../../location/dto';
import { User } from '../../user/schema';

export class SignInReq {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

@Exclude()
export class SignInRes extends PickType(User, [
    'uuid',
    'username',
    'email',
]) {
    locations: LocationDto[];
    accessToken: string;
}