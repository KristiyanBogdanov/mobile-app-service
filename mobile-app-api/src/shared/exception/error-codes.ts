export enum ErrorCode {
    // Bad Request:
    GenericBadRequest = 4000,
    TooShortUsername = 4001,
    InvalidEmailFormat = 4002,
    WeakPassword = 4003,
    TooLongLocationName = 4004,
    InvalidSTSerialNumber = 4005,
    InvalidWSSerialNumber = 4006,
    InvalidLocationUuid = 4007,
    // Unauthorized:
    InvalidEmail = 4011,
    InvalidPassword = 4012,
    InvalidAccessToken = 4013,
    // Conflict:
    EmailAlreadyUsed = 4091, // not used yet
    STSerialNumberAlreadyUsed = 4092,
    LocationAlreadyAdded = 4093,
    // Internal Server Error:
    FailedToAddLocation = 5001,
}