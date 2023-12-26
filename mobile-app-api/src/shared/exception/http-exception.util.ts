import { ErrorCode } from './error-codes';

export type HttpExceptionRecord = {
    name: string
    code: ErrorCode;
    message: string;
};

export type HttpExceptionBody = {
    error: HttpExceptionRecord | HttpExceptionRecord[];
};

export function createHttpExceptionRecord(code: ErrorCode, message: string): HttpExceptionRecord {
    return { name: 'HttpException', code, message };
}

export function createHttpExceptionBody(code: ErrorCode, message: string): HttpExceptionBody {
    return { error: createHttpExceptionRecord(code, message) };
}

export function createHttpExceptionBodyList(errors: HttpExceptionRecord[]): HttpExceptionBody {
    return { error: errors };
}