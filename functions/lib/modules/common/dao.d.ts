export declare const execSingleQueryWithParams: (sql: string, params: Array<string>) => Promise<unknown>;
export declare class Postgres {
    private client;
    init(): Promise<void>;
    execute(query: string, params?: any[]): Promise<any>;
    release(): Promise<void>;
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
export declare const execMultiQueryWithTransaction: (func: (db: Postgres, ...param: any) => any, ...param: any) => Promise<unknown>;
