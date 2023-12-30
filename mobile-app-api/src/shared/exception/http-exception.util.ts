import { ErrorCode, ErrorCodeMessages } from './error-codes';

export type HttpExceptionRecord = {
    type: string
    code: ErrorCode;
    message: string;
};

export type HttpExceptionBody = {
    error: HttpExceptionRecord | HttpExceptionRecord[];
};

export function createHttpExceptionRecord(code: ErrorCode, message: string): HttpExceptionRecord {
    return { type: 'HttpException', code, message };
}

export function createHttpExceptionBody(code: ErrorCode): HttpExceptionBody {
    return { error: createHttpExceptionRecord(code, ErrorCodeMessages[code]) };
}

export function createHttpExceptionBodyList(records: HttpExceptionRecord[]): HttpExceptionBody {
    return { error: records };
}