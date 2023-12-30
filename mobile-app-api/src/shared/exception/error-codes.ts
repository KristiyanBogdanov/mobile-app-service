import { LOCATION_NAME_MAX_LENGTH, LOCATION_NAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '../constants';

export enum ErrorCode {
    // Bad Request:
    GenericBadRequest = 4000,
    InvalidUsernameLength,
    InvalidEmailFormat,
    WeakPassword,
    InvalidLocationNameLength,
    InvalidCapacity,
    InvalidSTSerialNumber,
    InvalidWSSerialNumber,
    InvalidLocationUuid,
    // Unauthorized:
    InvalidEmail = 4011,
    InvalidPassword,
    InvalidAccessToken,
    // Conflict:
    EmailIsAlreadyUsed = 4091,
    STSerialNumberAlreadyUsed,
    LocationAlreadyAdded,
    // Not Found:
    UserNotFound = 4041,
    // Internal Server Error:
    FailedToAddLocation = 5001,
}

export const ErrorCodeMessages: Record<ErrorCode, string> = {
    // Bad Request:
    [ErrorCode.GenericBadRequest]: 'Bad Request',
    [ErrorCode.InvalidUsernameLength]: `Username length must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`,
    [ErrorCode.InvalidEmailFormat]: 'Invalid email format',
    [ErrorCode.WeakPassword]: 'Weak password',
    [ErrorCode.InvalidLocationNameLength]: `Location name length must be between ${LOCATION_NAME_MIN_LENGTH} and ${LOCATION_NAME_MAX_LENGTH} characters`,
    [ErrorCode.InvalidCapacity]: 'Capacity must be a positive integer',
    [ErrorCode.InvalidSTSerialNumber]: 'Invalid ST serial number',
    [ErrorCode.InvalidWSSerialNumber]: 'Invalid WS serial number',
    [ErrorCode.InvalidLocationUuid]: 'Invalid location uuid',
    // Unauthorized:
    [ErrorCode.InvalidEmail]: 'Invalid email',
    [ErrorCode.InvalidPassword]: 'Invalid password',
    [ErrorCode.InvalidAccessToken]: 'Invalid access token',
    // Conflict:
    [ErrorCode.EmailIsAlreadyUsed]: 'Email is already used',
    [ErrorCode.STSerialNumberAlreadyUsed]: 'ST serial number is already used',
    [ErrorCode.LocationAlreadyAdded]: 'Location is already added',
    // Not Found:
    [ErrorCode.UserNotFound]: 'User not found',
    // Internal Server Error:
    [ErrorCode.FailedToAddLocation]: 'Failed to add location to user',
};