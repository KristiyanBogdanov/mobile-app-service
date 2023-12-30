import { IsStrongPasswordOptions } from 'class-validator';

export const LOCATION_NAME_MIN_LENGTH = 3;
export const LOCATION_NAME_MAX_LENGTH = 25;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const STRONG_PASSWORD_OPTIONS: IsStrongPasswordOptions = {
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 0,
};