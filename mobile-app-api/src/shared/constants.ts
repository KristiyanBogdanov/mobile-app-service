import { IsStrongPasswordOptions } from 'class-validator';

export const USERNAME_MIN_LENGTH = 3;
export const STRONG_PASSWORD_OPTIONS: IsStrongPasswordOptions = {
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 0,
};