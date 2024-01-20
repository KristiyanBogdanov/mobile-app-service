import { IHwNotification } from '../../hw-notification/interface';
import { ILocation } from '../../location/interface';

export interface IUser {
    uuid: string;
    fcmTokens: string[];
    username: string;
    email: string;
    password: string;
    locations: ILocation[];
    hwNotifications: IHwNotification[];

    // TODO: Add this later
    // country: string;
    // birthday: Date;
}