export namespace DBTYPES {
    let PG: string;
    let MSSQL: string;
    let MARIA: string;
    let SQLITE: string;
}
export namespace DBSTATE {
    let CLOSED: number;
    let OPEN: number;
}
/** SQL connection pool and executor
 * @class
 * @constructs SqlQuest
 * @property {string} dbType - DBTYPES.*
 * @property {Promise<PgPool>} pgPool - pg connection pool
 * @property {Promise<PgPoolClient>} pgClient - pg connection
 * @property {Promise<MsPool>} msPool - mssql connection pool
 * @property {Promise<MsPool>} msConn - Individual connection for querying
 * @property {Promise<MariaPool>} myPool - MariaDB/MySQL pool
 * @property {Promise<Sqlite3Database>} sqlite - Database
 * @property {string} databasePath - Sqlite database file path for creating transaction connections
 * @property {object} sqlConfig - Database server name, db, and login credentials
 * @property {string} dbNameAndServer - GETTER of Server and database name
 * @property {string} tableNamePrefix - typically 'dbo.' for mssql
 * @property {DBSTATE} dbState - 0=Not open, 1=open
 * @property {boolean} lowerCaseNames - True=PathMap initializer will lower case table and column names
 * @property {boolean} noBrackets - True=PathMap will not add delimiters to columns and table names
 * @property {string} sqlWildCardChar - ? or _
 */
export default class SqlQuest {
    /**;
     * @constructor
     *
     * @overload
     * @param {pgConfig} sqlQuestConfig
     * @returns
     *
     * @overload
     * @param {mssqlConfig} sqlQuestConfig
     * @returns
     *
     * @overload
     * @param {mariaConfig} sqlQuestConfig
     * @returns
     *
     * @param {pgConfig & mariaConfig & mssqlConfig} sqlQuestConfig
     * @returns
     *
     * Sqlite3 piggybacks on the 'database' string property for configuration
     *
     * ALWAYS CALL `await this.dbOpen()` after NEWing
     */
    constructor(sqlQuestConfig: pgConfig);
    /**;
     * @constructor
     *
     * @overload
     * @param {pgConfig} sqlQuestConfig
     * @returns
     *
     * @overload
     * @param {mssqlConfig} sqlQuestConfig
     * @returns
     *
     * @overload
     * @param {mariaConfig} sqlQuestConfig
     * @returns
     *
     * @param {pgConfig & mariaConfig & mssqlConfig} sqlQuestConfig
     * @returns
     *
     * Sqlite3 piggybacks on the 'database' string property for configuration
     *
     * ALWAYS CALL `await this.dbOpen()` after NEWing
     */
    constructor(sqlQuestConfig: mssqlConfig);
    /**;
     * @constructor
     *
     * @overload
     * @param {pgConfig} sqlQuestConfig
     * @returns
     *
     * @overload
     * @param {mssqlConfig} sqlQuestConfig
     * @returns
     *
     * @overload
     * @param {mariaConfig} sqlQuestConfig
     * @returns
     *
     * @param {pgConfig & mariaConfig & mssqlConfig} sqlQuestConfig
     * @returns
     *
     * Sqlite3 piggybacks on the 'database' string property for configuration
     *
     * ALWAYS CALL `await this.dbOpen()` after NEWing
     */
    constructor(sqlQuestConfig: mariaConfig);
    /** @type {string} */ dbType: string;
    /** @type {PgPool|undefined} */ pgPool: PgPool | undefined;
    /** @type {PgPoolClient|undefined} */ pgClient: PgPoolClient | undefined;
    /** @type {MsPool|undefined} */ msPool: MsPool | undefined;
    /** @type {MsPool|undefined} */ msConn: MsPool | undefined;
    /** @type {MariaPool|undefined} */ myPool: MariaPool | undefined;
    /** @type {Sqlite3Database|undefined} */ sqlite: Sqlite3Database | undefined;
    /** @type {string} SQLite */ databasePath: string;
    /** @type {pgConfig|mssqlConfig|mariaConfig|sqlQuestConfig} */ sqlConfig: pgConfig | mssqlConfig | mariaConfig | sqlQuestConfig;
    /** @type {string} */ dbIdAndServerName: string;
    /** @type {string} */ tableNamePrefix: string;
    /** @type {number} */ dbState: number;
    /** @type {boolean} */ lowerCaseNames: boolean;
    /** @type {boolean} */ noBrackets: boolean;
    /** @type {string} */ sqlWildCardChar: string;
    /** (async) dbOpen(); Client connection for the pool
     * @async
     * @method dbOpen - MUST BE CALLED after instantiating object
     * @returns {Promise<boolean>}
     */
    dbOpen(): Promise<boolean>;
    /** (async) dbClose(); Close connection pool
     * @async
     * @method dbClose
     */
    dbClose(): Promise<any>;
    /** (async) query(sql); Query SQL database
     * @async
     * @method query - Query connection or pool, return recordsets
     * @param {string} sql - Prepared SQL statement
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<Array<*>>}
     * Returns array of record objects
     */
    query(sql: string, reqId?: string): Promise<Array<any>>;
    /** (async) execute(sql); Execute SQL on database
     * @async
     * @method execute - Execute SQL, return number of rows affected
     * @param {string} sql - Prepared statement
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<number>} - Count of records affected
     */
    execute(sql: string, reqId?: string): Promise<number>;
    /**
     * @async
     * @method streamQuery - Return stream of objects or characters
     * @param {string} sql - SQL query
     * @param {string} [reqId] - Request ID or tracking code
     * @param {boolean} [objectMode] - Return raw SQL objects? (false === return JSON stringified)
     * @returns {Promise<Readable|void>}
     */
    streamQuery(sql: string, reqId?: string, objectMode?: boolean): Promise<Readable | void>;
    /**
     * SQL TRANSACTION methods - transCommit or transRollback MUST be called
     * following transBegin, or connection handle will not be released
     */
    /**
     * @async
     * @method transBegin - Begin transaction, return database connection handle
     * @param {string} [reqId] - Request ID or tracking code
     *
     * @returns {Promise<
     *   PgPoolClient |
     *   MssqlTransaction |
     *   MariaConnection |
     *   Sqlite3Database |
     *   undefined>}
     */
    transBegin(reqId?: string): Promise<PgPoolClient | MssqlTransaction | MariaConnection | Sqlite3Database | undefined>;
    /**
     * @async
     * @method transAct - Perform part of a transaction
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|unknown>}
     */
    transAct(transHandle: PgPoolClient, sql: string, reqId?: string): Promise<void | Error>;
    /**
     * @async
     * @method transAct - Perform part of a transaction
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|unknown>}
     */
    transAct(transHandle: MssqlTransaction, sql: string, reqId?: string): Promise<void | Error>;
    /**
     * @async
     * @method transAct - Perform part of a transaction
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|unknown>}
     */
    transAct(transHandle: MariaConnection, sql: string, reqId?: string): Promise<void | Error>;
    /**
     * @async
     * @method transAct - Perform part of a transaction
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} sql - The SQL code to run
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<void|unknown>}
     */
    transAct(transHandle: Sqlite3Database, sql: string, reqId?: string): Promise<void | Error>;
    /**
     * @async
     * @method transCommit
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transCommit(transHandle: PgPoolClient, reqId?: string): Promise<boolean | Error>;
    /**
     * @async
     * @method transCommit
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transCommit(transHandle: MssqlTransaction, reqId?: string): Promise<boolean | Error>;
    /**
     * @async
     * @method transCommit
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transCommit(transHandle: MariaConnection, reqId?: string): Promise<boolean | Error>;
    /**
     * @async
     * @method transCommit
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *         import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transCommit(transHandle: Sqlite3Database, reqId?: string): Promise<boolean | Error>;
    /**
     * @async
     * @method transRollback
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaPoolConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *        import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transRollback(transHandle: PgPoolClient, reqId?: string): Promise<boolean | Error>;
    /**
     * @async
     * @method transRollback
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaPoolConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *        import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transRollback(transHandle: MssqlTransaction, reqId?: string): Promise<boolean | Error>;
    /**
     * @async
     * @method transRollback
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaPoolConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *        import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transRollback(transHandle: MariaPoolConnection, reqId?: string): Promise<boolean | Error>;
    /**
     * @async
     * @method transRollback
     *
     * @overload
     * @param {PgPoolClient} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MssqlTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {MariaPoolConnection} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     *
     * @overload
     * @param {Sqlite3Database} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>}
     * // Implementation signature requires sqlite3 take precedence over mysql2 in this method
     * @param {Sqlite3Database &
     *        import('pg').PoolClient &
     *         import('mysql2').PoolConnection &
     *         import('mssql').Transaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|unknown>}
     */
    transRollback(transHandle: Sqlite3Database, reqId?: string): Promise<boolean | Error>;
    /** SQL Injection methods */
    /**
     * @method sqlString - Prepare a string for SQL injection
     * @param {string|Buffer|number|boolean|undefined} strText - Thing to prepare
     * @param {boolean} [nullIfBlank] - Optional 'NULL' string literal if string is empty
     * @returns {string} SQL safe string
     */
    sqlString(strText: string | Buffer | number | boolean | undefined, nullIfBlank?: boolean): string;
    /**
     * @method sqlDouble - Prepare a double float for SQL injection
     * @param {number} dblNumber - Number to convert to string
     * @returns {string} SQL ready string
     */
    sqlDouble(dblNumber: number): string;
    /**
     * @method sqlFixed - Create a fixed point string from floating point number
     * @param {number} dblNumber - Number to convert
     * @param {number} decimals - Decimals to simulate
     * @returns {string} SQL ready string
     */
    sqlFixed(dblNumber: number, decimals: number): string;
    /**
     * @method sqlInteger - Prepare an integer for SQL injection
     * @param {number} aNumber - Number to convert to string
     * @returns {string} SQL ready string
     */
    sqlInteger(aNumber: number): string;
    /**
     * @method sqlBoolean - Prepare a T/F value for SQL injection
     * @param {boolean} aValue - Number to convert to string
     * @returns {string} SQL ready string
     */
    sqlBoolean(aValue: boolean): string;
    #private;
}
export type PgPool = import("pg").Pool;
export type PgPoolClient = import("pg").PoolClient;
export type PgQueryArrayResult = import("pg").QueryArrayResult;
export type MsPool = import("mssql").ConnectionPool;
export type MsIResult = import("mssql").IResult<Array<any>>;
export type MssqlTransaction = import("mssql").Transaction;
export type MariaPool = import("mysql2").Pool;
export type MariaConnection = import("mysql2").PoolConnection;
export type MariaRowDataPacket = import("mysql2").RowDataPacket;
export type Sqlite3Database = import("sqlite3").Database;
import { Readable } from 'node:stream';
//# sourceMappingURL=SqlQuest.d.ts.map