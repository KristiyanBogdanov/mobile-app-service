export interface ILocation {
    uuid: string;
    name: string;
    location: string; // TODO: refactor to be a lat/long object
    capacity: number;
    solarTrackers: string[];
    weatherStation: string;
    cctv: string;
    owner: string;
    sharedWith: string[];
}