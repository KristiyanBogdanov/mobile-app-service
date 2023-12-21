export class ValidateSerialNumberHwApiRes {
    isValid: boolean;
}

export class ValidateSerialNumberRes {
    isValid: boolean;
    isUsed?: boolean;
    isAdded?: boolean;
}