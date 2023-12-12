import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

export abstract class EntityRepository<T> {
    constructor(protected readonly entityModel: Model<T>) { }

    async findById(entityId: string, projection?: Record<string, unknown>): Promise<(T & Document) | null> {
        return await this.entityModel.findById(entityId, projection);
    }

    async findOne(entityFilterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<(T & Document) | null> {
        return await this.entityModel.findOne(entityFilterQuery, projection);
    }

    async find(entityFilterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<(T & Document)[] | null> {
        return await this.entityModel.find(entityFilterQuery, projection);
    }

    async create(entity: T): Promise<T & Document> {
        return await this.entityModel.create(entity);
    }

    async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: Record<string, unknown>): Promise<number> {
        const result = await this.entityModel.updateOne(filter, update, options);
        return result.modifiedCount;
    }
}