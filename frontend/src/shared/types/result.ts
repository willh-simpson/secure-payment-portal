export type Ok<T> = { success: true; data: T };
export type Error = { success: false; error: string };
export type Result<T> = Ok<T> | Error;

export const Results = {
    ok<T>(data: T): Result<T> {
        return { success: true, data };
    },

    fail<T = never>(error: string): Result<T> {
        return { success: false, error };
    },

    isOk<T>(r: Result<T>): r is Ok<T> {
        return r.success;
    },

    isError<T>(r: Result<T>): r is Error {
        return !r.success;
    },
};
