import { ValidationError } from 'class-validator';

export class ValidationException extends Error {
    private readonly errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        super();
        this.errors = errors;
    }

    getErrors(): ValidationError[] {
        return this.errors;
    }
}