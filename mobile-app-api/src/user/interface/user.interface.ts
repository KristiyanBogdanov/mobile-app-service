import { ILocation } from '../../location/interface';
import { IHwNotification } from '../interface';

export interface IUser {
    id: string;
    fcmTokens: string[];
    username: string;
    email: string;
    password: string;
    locations: ILocation[];
    hwNotifications: IHwNotification[];
    refreshToken: string;

    // TODO: Add this later
    // country: string;
    // birthday: Date;
}