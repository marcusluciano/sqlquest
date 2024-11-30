/**
 * SqlQuest configuration file
 */
type sqlQuestConfig = {
    /**
     * - 'mssql' || 'pg' || 'mysql' || 'sqlite3'
     */
    dbType: string;
    /**
     * - Database config object
     */
    config: import("mssql").config | import("pg").PoolConfig | import("mysql2").PoolOptions | undefined;
    /**
     * - SQL table and column names
     */
    lowerCaseNames?: boolean;
    /**
     * - Around SQL table and column names
     */
    noBrackets?: boolean;
    /**
     * - File path
     */
    sslKeyLocation: string;
    /**
     * - File path
     */
    sslCertLocation: string;
    /**
     * - 'dbo.' for mssql
     */
    sqltableprefix?: string;
    /**
     * - Distinct requesters in past N minutes
     */
    userCountTimer?: number;
};
type pgConfig = {
    /**
     * - 'pg'
     */
    dbType: string;
    /**
     * - Database config object
     */
    config: import("pg").PoolConfig;
    /**
     * - SQL table and column names
     */
    lowerCaseNames?: boolean;
    /**
     * - Around SQL table and column names
     */
    noBrackets?: boolean;
    /**
     * - File path
     */
    sslKeyLocation: string;
    /**
     * - File path
     */
    sslCertLocation: string;
    /**
     * - 'dbo.' for mssql
     */
    sqltableprefix?: string;
    /**
     * - Distinct requesters in past N minutes
     */
    userCountTimer?: number;
};
type mssqlConfig = {
    /**
     * - 'mssql'
     */
    dbType: string;
    /**
     * - Database config object
     */
    config: import("mssql").config;
    /**
     * - 'dbo.' for mssql
     */
    sqltableprefix?: string;
    /**
     * - SQL table and column names
     */
    lowerCaseNames?: boolean;
    /**
     * - Around SQL table and column names
     */
    noBrackets?: boolean;
    /**
     * - File path
     */
    sslKeyLocation: string;
    /**
     * - File path
     */
    sslCertLocation: string;
    /**
     * - Distinct requesters in past N minutes
     */
    userCountTimer?: number;
};
type mariaConfig = {
    /**
     * - 'mysql2'
     */
    dbType: string;
    /**
     * - Database config object
     */
    config: import("mysql2").PoolOptions;
    /**
     * - SQL table and column names
     */
    lowerCaseNames?: boolean;
    /**
     * - Around SQL table and column names
     */
    noBrackets?: boolean;
    /**
     * - File path
     */
    sslKeyLocation: string;
    /**
     * - File path
     */
    sslCertLocation: string;
    /**
     * - 'dbo.' for mssql
     */
    sqltableprefix?: string;
    /**
     * - Distinct requesters in past N minutes
     */
    userCountTimer?: number;
};
//# sourceMappingURL=sql-quest-config-types.d.ts.map