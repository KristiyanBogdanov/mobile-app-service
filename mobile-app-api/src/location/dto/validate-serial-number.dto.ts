export class ValidateSTSerialNumberHwApiRes {
    isValid: boolean;
    capacity?: number;
}

export class ValidateWSSerialNumberHwApiRes {
    isValid: boolean;
}

export class ValidateSerialNumberRes {
    isValid: boolean;
    isUsed?: boolean;
    isAdded?: boolean;
}