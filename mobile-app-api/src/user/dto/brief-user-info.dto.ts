import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { User } from '../schema';

@Exclude()
export class BriefUserInfo extends PickType(User, [
    'id',
    'username',
    'email',
]) { }