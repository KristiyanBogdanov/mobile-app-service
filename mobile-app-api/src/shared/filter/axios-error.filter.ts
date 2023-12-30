import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

@Catch(AxiosError)
export class AxiosErrorFilter implements ExceptionFilter {
    catch(error: AxiosError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: {
                type: error.name,
                axiosCode: error.code,
                message: error.message
            }
        });
    }
}