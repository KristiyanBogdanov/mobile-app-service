import { ILocation } from '../../location/interface';

export interface IUser {
    uuid: string;
    username: string;
    email: string;
    password: string;
    locations: ILocation[];

    // TODO: Add this later
    // country: string;
    // birthday: Date;
}