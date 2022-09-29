export declare const rateLimitArgs: {
    redis: {
        url: string;
        username: string;
        password: string;
        database: string;
        no_ready_check: boolean;
        auth_pass: string;
    };
    timeframe: number;
    limit: number;
    headers: boolean;
    whitelist: string[];
    customRoutes: ({
        path: string;
        method: string;
        timeframe: number;
        limit: number;
        ignore?: undefined;
    } | {
        path: RegExp;
        method: string;
        timeframe: number;
        limit: number;
        ignore?: undefined;
    } | {
        path: string;
        method: string;
        ignore: boolean;
        timeframe?: undefined;
        limit?: undefined;
    })[];
};
