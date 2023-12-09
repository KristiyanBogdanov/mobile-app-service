import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';
import { STRONG_PASSWORD_OPTIONS, USERNAME_MIN_LENGTH } from '../../shared/constants'

/*
    @Info: Custom error messages are specified exclusively for user text-input fields.
*/
export class SignUpReq {
    @IsString()
    @MinLength(USERNAME_MIN_LENGTH, { message: 'Username is too short' })
    username: string;

    @IsEmail({}, { message: 'Invalid email' })
    email: string;

    @IsStrongPassword(STRONG_PASSWORD_OPTIONS, { message: 'Password is too weak' })
    password: string;
}