import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from 'class-validator';
import { STRONG_PASSWORD_OPTIONS, USERNAME_MIN_LENGTH } from '../../shared/constants'
import { ErrorCode } from '../../shared/exception/error-codes';

export class SignUpReq {
    @IsString()
    @MinLength(USERNAME_MIN_LENGTH, { context: { errorCode: ErrorCode.TooShortUsername } })
    username: string;

    @IsEmail({}, { context: { errorCode: ErrorCode.InvalidEmailFormat } })
    email: string;

    @IsStrongPassword(STRONG_PASSWORD_OPTIONS, { context: { errorCode: ErrorCode.WeakPassword } })
    password: string;
}