import { Schema } from '@nestjs/mongoose';
import { PickType } from '@nestjs/mapped-types';
import { Exclude } from 'class-transformer';
import { User } from '../schema';
import { IBriefUserInfo } from '../interface';

@Exclude()
@Schema({ _id: false })
export class BriefUserInfo extends PickType(User, [
    'id',
    'username',
]) implements IBriefUserInfo { }