/**
 * Shared type definitions and utilities for better type safety
 */

// ========== Common Response Types ==========

export interface ApiBaseResponse {
    statusCode: number;
    message: string;
}

export interface ApiSuccessResponse<T> extends ApiBaseResponse {
    content: T;
    statusCode: 200;
}

export interface ApiErrorResponse extends ApiBaseResponse {
    statusCode: number;
    message: string;
}

// ========== Utility Types ==========

/**
 * Make all properties of type T optional
 */
export type Partial<T> = {
    [P in keyof T]?: T[P];
};

/**
 * Make all properties of type T required
 */
export type Required<T> = {
    [P in keyof T]-?: T[P];
};

/**
 * Get the type of a property from an object
 */
export type PropertyType<T, K extends keyof T> = T[K];

/**
 * Union type of all property values in T
 */
export type PropertyValue<T> = T[keyof T];

/**
 * Create a type where all properties are readonly
 */
export type ReadOnly<T> = {
    readonly [P in keyof T]: T[P];
};

// ========== Form-Related Types ==========

export interface FormField {
    id: string;
    value: string;
    error?: string;
    isValid?: boolean;
}

export interface FormState {
    fields: Record<string, FormField>;
    isValid: boolean;
    isDirty: boolean;
}

// ========== Test Data Types ==========

export interface TestUser {
    taiKhoan: string;
    matKhau: string;
    hoTen?: string;
    email?: string;
    soDT?: string;
}

export interface TestUserCollection {
    admin: TestUser;
    regularUser: TestUser;
    invalidUser: TestUser;
    newUser: TestUser;
}

// ========== Assertion Helper Types ==========

export interface AssertionResult {
    passed: boolean;
    message: string;
    actualValue?: any;
    expectedValue?: any;
}

/**
 * Result type for operations that can succeed or fail
 */
export type Result<T, E = Error> = 
    | { ok: true; value: T }
    | { ok: false; error: E };

/**
 * Helper to create success result
 */
export function ok<T>(value: T): Result<T> {
    return { ok: true, value };
}

/**
 * Helper to create error result
 */
export function err<E>(error: E): Result<any, E> {
    return { ok: false, error };
}
