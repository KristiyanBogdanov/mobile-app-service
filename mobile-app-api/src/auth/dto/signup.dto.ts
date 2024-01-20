import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../../user/schema';

export class SignUpReq extends PickType(User, [
    'username',
    'email',
    'password',
]) {
    @IsString()
    @IsNotEmpty()
    fcmToken: string;
}