export type APIResponseType<T> = {
    status: boolean;
    statusCode?: number;
    message?: string;
    payload?: T
}