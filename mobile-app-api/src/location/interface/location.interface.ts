import { IUser } from '../../user/interface';
import { ISolarTracker } from './solar-tracker.interface';

export interface ILocation {
    id: string;
    uuid: string;
    name: string;
    capacity: number;
    solarTrackers: string[];
    weatherStation?: string;
    cctv?: string;
    owner: string;
    sharedWith: IUser[];
}