import { SolarTrackerDto } from './solar-tracker.dto';

export class ValidateSTSerialNumberHwApiRes {
    isValid: boolean;
    capacity?: number;
}

export class ValidateWSSerialNumberHwApiRes {
    isValid: boolean;
}

class ValidateSerialNumberRes {
    isValid: boolean;
    isUsed?: boolean;
    isAdded?: boolean;
}

export class ValidateSTSerialNumberRes extends ValidateSerialNumberRes {
    solarTracker?: SolarTrackerDto;
}

export class ValidateWSSerialNumberRes extends ValidateSerialNumberRes { }