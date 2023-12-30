import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ErrorCode, createHttpExceptionBody } from '../exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const errorCode = parseInt(exception.getResponse().toString()) as ErrorCode;

        response.status(exception.getStatus()).json(
            createHttpExceptionBody(errorCode)
        );
    }
}