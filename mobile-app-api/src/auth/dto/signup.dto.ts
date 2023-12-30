import { PickType } from '@nestjs/mapped-types';
import { User } from '../../user/schema';

export class SignUpReq extends PickType(User, [
    'username',
    'email',
    'password',
]) { }