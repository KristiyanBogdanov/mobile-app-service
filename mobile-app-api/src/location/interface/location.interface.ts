import { IUser } from '../../user/interface';
import { ISolarTracker } from './solar-tracker.interface';

export interface ILocation {
    id: string;
    name: string;
    solarTrackers: ISolarTracker[];
    weatherStation?: string;
    cctv?: string;
    owner: string;
    sharedWith: IUser[];
}