import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../../user/schema';

export class SignUpReq extends PickType(User, [
    'username',
    'email',
    'password',
]) {
    readonly username: User['username'];
    readonly email: User['email'];
    readonly password: User['password'];

    @IsString()
    @IsNotEmpty()
    readonly fcmToken: string;
}