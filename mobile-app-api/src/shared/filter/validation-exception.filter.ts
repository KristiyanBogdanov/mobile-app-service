import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { ErrorCode, ValidationException, createHttpExceptionBodyList, createHttpExceptionRecord } from '../exception';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: ValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const records = exception.getErrors().map((error) => {
            const constraint = Object.keys(error.constraints)[0];
            const message = error.constraints[constraint];
            let code = ErrorCode.GenericBadRequest;

            if (error.contexts && error.contexts[constraint]) {
                code = error.contexts[constraint].errorCode;
            }

            return createHttpExceptionRecord(code, message);
        });

        response.status(HttpStatus.BAD_REQUEST).json(
            createHttpExceptionBodyList(records)
        );
    }
}