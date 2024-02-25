import { PickType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BriefUserInfo } from '../../user/dto';
import { Service } from '../schema';

@Exclude()
export class ServiceDto extends PickType(Service, [
    'id',
    'title',
    'description',
    'images',
    'pricingOption',
    'price',
    'category',
    'createdAt',
]) {
    amIPublisher: boolean;
    publisher: BriefUserInfo;
}