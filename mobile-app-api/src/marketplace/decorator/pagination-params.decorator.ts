import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { MARKETPLACE_PAGINATION_LIMIT } from '../../shared/constants';

export interface Pagination {
    page: number;
    limit: number;
    offset: number;
}

export const PaginationParams = createParamDecorator((data, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    if (isNaN(page) || page < 0 || isNaN(limit) || limit < 0) {
        throw new BadRequestException();
    }

    if (limit > MARKETPLACE_PAGINATION_LIMIT) {
        throw new BadRequestException();
    }

    const offset = page * limit;

    return { page, limit, offset };
});