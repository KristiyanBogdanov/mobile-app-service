import { IUser } from '../../user/interface';
import { PricingOption, PublicationType } from '../enum';

export interface IPublication {
    id: string;
    // type: PublicationType;
    title: string;
    description: string;
    images: string[];
    pricingOption: PricingOption;
    price: number;
    // location: string; // TODO: figure out how to handle location
    createdAt: Date;
    publisher: IUser;
}