import { IBriefUserInfo } from '../../user/interface';

export interface ILocation {
    id: string;
    uuid: string;
    name: string;
    capacity: number;
    solarTrackers: string[];
    weatherStation?: string;
    cctv?: string;
    owner: string;
    sharedWith: IBriefUserInfo[];
}