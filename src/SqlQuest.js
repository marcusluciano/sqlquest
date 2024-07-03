/**
 * @fileoverview SQL Query - Execute - Stream - Transact
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @classdesc SQL library wrapper
 * 
 * @exports SqlQuest
 * 
 * * * * * *  YOU MUST CALL dbOpen AFTER NEWing  * * * * *
 * @method dbOpen() - Opens database connections
 * 
 * @method dbClose() - Closes the database connection pool
 * 
 * @method #sqlQueryExecute() called by query() and execute()
 * 
 * @method query() - Performs SELECT on an SQL query string, returns one recordset
 * @method execute() - Executes an SQL command, returns count of records affected
 * @method streamQuery() - Performs query() and returns readable stream of data
 * @method transBegin() - Begin a transaction (returns 'transaction object')
 * @method transAct() - Perform part of a transaction (via transaction object)
 * @method transCommit() - Commit a transaction (via transaction object))
 * @method transRollback() - Roll back a transaction (via transaction object)
 * 
 * SQL Injection methods
 * @method sqlString() - Format a string for SQL injection
 * @method sqlDouble() - Format a double float for SQL injection as double float
 * @method sqlInteger() - Format a number for SQL injection as an integer
 * @method sqlBoolean() - Format a boolean for SQL injection as a bit
 * 
 * Any valid SQL strings can be passed to exec, query, streamQuery, and transAct
 * 
 * All values must be pre-validated, we don't do that here
 */
/**
 * @todo TS Overload on JSDoc applied to ES2020 will not work 100%.
 * Pick your poison, it's either overload JSDoc errors or constructor
 * parameter 'type any' errors.  Need to addess via .d.ts or conversion to TS
 */
/**
 * @typedef {import('pg').Pool} PgPool
 * @typedef {import('pg').PoolClient} PgPoolClient
 * @typedef {import('pg').QueryArrayResult} PgQueryArrayResult
 * 
 * @typedef {import('mssql').ConnectionPool} MsPool
 * @typedef {import('mssql').IResult<Array<*>>} MsIResult
 * @typedef {import('mssql').Transaction} MssqlTransaction
 * 
 * @typedef {import('mysql2').Pool} MariaPool
 * @typedef {import('mysql2').PoolConnection} MariaConnection
 * @typedef {import('mysql2').RowDataPacket} MariaRowDataPacket
 * 
 * @typedef {import('sqlite3').Database} Sqlite3Database
 */

export const DBTYPES = {
    PG: 'pg',
    MSSQL: 'mssql',
    MARIA: 'mysql2',
    SQLITE: 'sqlite3',
};

export const DBSTATE = {
    CLOSED: 0,
    OPEN: 1,
};

import pg from 'pg';

import pgQueryStream from 'pg-query-stream';

import mssql from 'mssql';

import mysql from 'mysql2';

import sqlite3 from 'sqlite3';

import { Readable, Transform } from 'node:stream';

import SqliteReadable from './SqliteReadable.js';

import sqlSafeString from './sql-safe-string.js';

const { logError, logSqlError } = await import('./log-errors.js');

/** Streaming query high water mark 
 * @const {number} HIGH_WATER_MARK */
const HIGH_WATER_MARK = 100; // records

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

    /** @type {string} */ dbType = DBTYPES.MSSQL;

    /** @type {PgPool|undefined} */ pgPool;

    /** @type {PgPoolClient|undefined} */ pgClient;

    /** @type {MsPool|undefined} */ msPool;

    /** @type {MsPool|undefined} */ msConn;

    /** @type {MariaPool|undefined} */ myPool;

    /** @type {Sqlite3Database|undefined} */ sqlite;

    /** @type {string} SQLite */ databasePath = '';

    /** @type {pgConfig|mssqlConfig|mariaConfig|sqlQuestConfig} */ sqlConfig;

    /** @type {string} */ dbIdAndServerName = '';

    /** @type {string} */ tableNamePrefix = '';

    /** @type {number} */ dbState = DBSTATE.CLOSED;

    /** @type {boolean} */ lowerCaseNames = false;

    /** @type {boolean} */ noBrackets = true;

    /** @type {string} */ sqlWildCardChar = '_';

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
    constructor(sqlQuestConfig) {

        /** Required for dbOpen() */
        this.sqlConfig = sqlQuestConfig;

        this.dbType = sqlQuestConfig.dbType;

        if (this.dbType === DBTYPES.PG) {

            this.dbIdAndServerName = 
                (sqlQuestConfig.config?.database ? sqlQuestConfig.config?.database : '')
                + (sqlQuestConfig.config?.host ? '@' + sqlQuestConfig.config?.host : '')
                + (sqlQuestConfig.config?.port ? ':' + sqlQuestConfig.config?.port : '');

        } else if (this.dbType === DBTYPES.MSSQL) { 

            if (sqlQuestConfig.sqltableprefix) {
                this.tableNamePrefix = sqlQuestConfig.sqltableprefix
            }

            this.dbIdAndServerName = 
                sqlQuestConfig.config?.database ? sqlQuestConfig.config?.database : '' + '@'
                + (sqlQuestConfig.config?.server ? sqlQuestConfig.config?.server : '');

        } else if (this.dbType === DBTYPES.MARIA) {

            this.dbIdAndServerName = 
                (sqlQuestConfig.config?.database ? sqlQuestConfig.config?.database : '')
                + (sqlQuestConfig.config?.host ? '@' + sqlQuestConfig.config?.host : '')
                + (sqlQuestConfig.config?.port ? ':' + sqlQuestConfig.config?.port : '');

        }  else if (this.dbType === DBTYPES.SQLITE) {

            if (sqlQuestConfig.config?.database) {

                this.dbIdAndServerName = sqlQuestConfig.config.database;
                
            } else {
                this.dbIdAndServerName = 'SQLite3';
            }
        }

        if (sqlQuestConfig.noBrackets) { this.noBrackets = true };

        if (sqlQuestConfig.lowerCaseNames) { this.lowerCaseNames = true };
    }

    /** (async) dbOpen(); Client connection for the pool
     * @async 
     * @method dbOpen - MUST BE CALLED after instantiating object
     * @returns {Promise<boolean>}
     */
    async dbOpen() {

        if ( ! this.sqlConfig?.config) { return false };

        try {
            if (this.dbType === DBTYPES.PG) {
                // @ts-ignore
                this.pgPool = new pg.Pool(this.sqlConfig?.config)
                    .on ('error', (err, client) => {
                        client.release()
                        throw err
                    });

                this.pgClient = await this.pgPool.connect()
                    .catch(err => {
                        throw err
                    });

                console.log('Connected to pg@', this.dbIdAndServerName);

            } else if (this.dbType === DBTYPES.MSSQL && this.sqlConfig && this.sqlConfig.config) {

                // @ts-ignore
                this.msPool = new mssql.ConnectionPool(this.sqlConfig.config)
                    .on ('error', err => { 
                        throw err
                    });
                    
                this.msConn = await this.msPool.connect()
                    .catch(err => {
                        throw err
                    });

                console.log('Connected to mssql@', this.dbIdAndServerName);

            } else if (this.dbType === DBTYPES.MARIA) { 

                this.myPool = await new Promise((resolve, reject) => {
                    try {
                        if (this.sqlConfig && this.sqlConfig.config) {
                            // @ts-ignore
                            resolve( mysql.createPool(this.sqlConfig.config) );

                        } else {
                            let err = new Error('sqlConfig.config(mysql) missing');
                            reject(err);
                            throw err    
                        }
                    } catch (err) {
                        reject(err);
                        throw err
                    }
                })

                console.log('Connected to mysql@', this.dbIdAndServerName);

            } else if (this.dbType === DBTYPES.SQLITE) {

                /** Required for creating transactions */
                this.databasePath = this.sqlConfig?.config?.database ? this.sqlConfig.config.database : '';
                
                this.sqlite = new sqlite3.Database(this.databasePath)
                    .on('error', (err) => {
                        throw err
                });
                console.log('Connected to sqlite3@', this.dbIdAndServerName);

            } else {
                throw new Error('SqlQuest database type dbType undefined');

            };
            /** Dispose of database password &c. - this function is 
             * one time only when this line is present */
            delete this.sqlConfig?.config;

            this.dbState = DBSTATE.OPEN;

            return true

        } catch (err) {
            logError(err, import.meta.url, 'dbOpen(' + this.dbType + ')', true, true);

            return false
        }
    }

    /** (async) dbClose(); Close connection pool
     * @async 
     * @method dbClose 
     */
    async dbClose() {

        try {
            if (this.dbType === DBTYPES.PG) {

                if (this.pgPool) { 
                    await this.pgPool.end().catch(err => {throw err})
                };

            } else if (this.dbType === DBTYPES.MSSQL) { 

                if (this.msPool) { 
                    await this.msPool.close().catch(err => {throw err}) 
                };

            } else if (this.dbType === DBTYPES.MARIA) {

                if (this.myPool) { 
                    this.myPool.end(err => {throw err}) 
                };

            } else if (this.dbType === DBTYPES.SQLITE) {

                this.sqlite?.close((err) => {throw err});

            } else {
                throw new Error('SqlQuest dbClose: database type undefined');
            };

            this.dbState = DBSTATE.CLOSED;

        } catch (err) {

            logError(err, import.meta.url, '.dbClose(' + this.dbIdAndServerName + ')');
            
            return err
        }
    }

    /** 
     * @async 
     * @method #sqlQueryExecute - Query connection or pool, return recordsets or record count
     * @param {string} sql - Prepared SQL statement
     * @param {boolean} isQuery - False = EXECUTE, True = SELECT (affects return only)
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<Array<*>|number|void|null>}
     * Returns array of record objects, or a count of records affected 
     */
    async #sqlQueryExecute(sql, isQuery, reqId) { 

        try {
            if (this.dbType === DBTYPES.PG && this.pgClient) { 

                /** @type {PgQueryArrayResult|void} */
                let pgResult = await this.pgClient.query(sql)
                .catch(err => {
                    if (err) { 
                        throw err
                    }
                });
                if (pgResult) {
                    if (isQuery) {
                        return pgResult?.rows
                    } else { // EXECUTE
                        return pgResult?.rowCount    
                    }
                } else {
                    return -1
                };

            } else if (this.dbType === DBTYPES.MSSQL && this.msConn) {

                /** @type {MsIResult} */
                let msResult = await this.msConn.request().query(sql)
                    .catch(err => {
                        throw err
                    });
                
                if (msResult) {
                    if (isQuery) {
                        if (msResult?.recordsets?.length > 0) {
                            return msResult?.recordsets[0]
                        } else {
                            return []        
                        };
                    } else { // EXECUTE
                        return msResult['rowsAffected'][0] 
                    }
                } else {
                    return -1
                };

            } else if (this.dbType === DBTYPES.MARIA && this.myPool) { 

                return await new Promise((resolve, reject) => {
                    if (this.myPool) {
                        this.myPool.query(sql, 
                            /**
                             * @param {Error} err 
                             * @param {MariaRowDataPacket} rows
                             */
                            function(err, rows) {
                                if (err) {
                                    reject(err)
                                };
                                if (isQuery) { // @ts-ignore
                                    resolve(rows)
                                } else { // EXECUTE
                                    resolve(rows.affectedRows)
                                };
                            }
                        )
                    } else {
                        reject(['Pool closed'])
                    };
                })

            } else if (this.dbType === DBTYPES.SQLITE && this.sqlite) {

                this.sqlite.all(sql, 
                    /**
                     * @param {Sqlite3Database} s3 
                     * @param {Error} err 
                     * @param {Array<*>} rows 
                     */
                    (s3, err, rows) => {
                        if (err) {
                            throw err
                        } else {
                            if (isQuery) {
                                return rows
                            } else {
                                return rows.length
                            }
                        }
                    }   
                )
            }

            throw new Error('.sqlQueryExecute: SqlQuest database pool undefined')

        } catch (err) {
            logSqlError(err, import.meta.url, this.dbIdAndServerName, 
                '.sqlQueryExecute(' + this.dbType + ') ' + this.dbIdAndServerName
                + reqId ? ', req-id: ' + reqId : '', true);

        }
    }

    /** (async) query(sql); Query SQL database
     * @async 
     * @method query - Query connection or pool, return recordsets
     * @param {string} sql - Prepared SQL statement
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<Array<*>>}
     * Returns array of record objects 
     */
    async query(sql, reqId) { 

        let res = await this.#sqlQueryExecute(sql, true, reqId)
            .catch(err => { return err });

        if (Array.isArray(res)) {
            return res
        } else {
            return []
        }
    }

    /** (async) execute(sql); Execute SQL on database
     * @async 
     * @method execute - Execute SQL, return number of rows affected
     * @param {string} sql - Prepared statement
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<number>} - Count of records affected
     */
    async execute(sql, reqId) {

        let res = await this.#sqlQueryExecute(sql, false, reqId)
            .catch(err => { return err });
        
        if (typeof res === 'number') {
            return res
        } else {
            return -1
        }
    }

    /** 
     * @async
     * @method streamQuery - Return stream of objects or characters
     * @param {string} sql - SQL query
     * @param {boolean} [objectMode] - Return raw SQL objects? (false === return JSON stringified)
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<Readable|void|unknown>}
     */
    async streamQuery(sql, objectMode, reqId) {

        try {
            /** @type {Readable|null} */ let stream = null;

            if (this.dbType === DBTYPES.PG && this.pgClient) { 
                
                stream = this.pgClient.query( new pgQueryStream(sql, [], 
                    { highWaterMark: HIGH_WATER_MARK })
                )

            } else if (this.dbType === DBTYPES.MSSQL && this.msConn) {

                const sqlRequest = this.msConn.request();

                stream = sqlRequest.toReadableStream( 
                    { highWaterMark: HIGH_WATER_MARK } 
                );

                sqlRequest.query(sql);

            } else if (this.dbType === DBTYPES.MARIA && this.myPool) {

                stream = this.myPool.query(sql).stream(
                    { highWaterMark: HIGH_WATER_MARK }
                )

            } else if (this.dbType === DBTYPES.SQLITE && this.sqlite) {

                stream = new SqliteReadable(
                    { sql: sql, db: this.sqlite, highWaterMark: HIGH_WATER_MARK }
                )
            };

            if (stream) {
                if (objectMode) {
                    return stream
                } else {
                    return stream.pipe( 
                        new Transform({
                            objectMode: true,
                            transform: (data, _, done) => {
                                done(null, JSON.stringify(data))
                            }
                        })
                    );
                }
            } else {
                throw new Error('SqlQuest.streamQuery: database pool undefined, req-id:' + reqId)
            }
        } catch (err) {
            logSqlError(err, import.meta.url, this.dbIdAndServerName, 
                '.streamQuery(' + this.dbType + ') ' + this.dbIdAndServerName
                + reqId ? ', req-id: ' + reqId : '', true)
            
            return err
        }
    }

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
     *   undefined|unknown>}
     */
    async transBegin(reqId) {

        try {
            if (this.dbType === DBTYPES.PG && this.pgPool) {

                if ( ! this.pgPool) throw new Error(this.dbIdAndServerName + '.pgPool undefined');

                /** @const {PgPoolClient} newTrans */
                const newTrans = await (this.pgPool).connect()
                    .catch(err => {
                        throw err
                    })

                await newTrans.query('BEGIN;')
                    .catch(err => {
                        throw err
                    })
                    
                return newTrans
                
            } else if (this.dbType === DBTYPES.MSSQL && this.msConn) { 

                /** @const {mssql.Transaction} newTrans */
                const newTrans = this.msConn.transaction();
                
                await newTrans.begin();

                return newTrans

            } else if (this.dbType === DBTYPES.MARIA && this.myPool) {

                if ( ! this.myPool) throw new Error(this.dbIdAndServerName + '.myPool undefined');

                this.myPool.getConnection(function(err, newTrans) {
                    if (err) throw err;

                    newTrans.beginTransaction(err => {
                        if (err) throw err
                    })
                    return newTrans
                })

            } else if (this.dbType === DBTYPES.SQLITE && this.sqlite) { 

                const sqlite3 = await import('sqlite3');

                /** @const {Sqlite3Database} s3Trans */
                const s3Trans = new sqlite3.Database(this.databasePath)
                .on('error', (err) => {/** @throws {Error} */
                    throw err
                })                

                /** @const {Sqlite3.Statement} sql3Statement */
                const sql3Statement = s3Trans.prepare('BEGIN;');
                sql3Statement.run();
                
                return s3Trans
                
            } else {
                throw new Error('SqlQuest transaction begin: database pool undefined, req-id:' + reqId)
            }
        } catch (err) {
            logSqlError(err, import.meta.url,this.dbIdAndServerName,
                'transBegin(' + this.dbType + '),'
                 + reqId ? 'req-id: ' + reqId : '', true);
            
            return err
        }
    }

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
    async transAct(transHandle, sql, reqId) {
        
        try {
            if (this.dbType === DBTYPES.PG && this.pgPool) { 

                await transHandle.query(sql)
                .catch(/** @param {*} err */ err => {
                    if (err)  {
                        transHandle.release();
                        throw err
                    }
                })

            } else if (this.dbType === DBTYPES.MSSQL && this.msPool) {  

                await transHandle.request().query(sql)
                .catch(err => {
                    if (err) {
                        throw err
                    }
                })

            } else if (this.dbType === DBTYPES.MARIA && this.myPool) {
            
                await new Promise((resolve, reject) => {

                    transHandle.query(sql,
                        /** @param {Error} err */
                        (err) => {
                            if (err) {
                                reject(err);
                                throw err
                            };
                            resolve(true)
                        }
                    )
                })
    
            } else if (this.dbType === DBTYPES.SQLITE && this.sqlite) { 

                /** @const {Sqlite3.Statement} sql3Statement */
                const sql3Statement = transHandle.prepare(sql);

                sql3Statement.run();

            } else {
                throw new Error('SqlQuest transaction: database pool handle undefined')
            }
        } catch (err) {
            logSqlError(err, import.meta.url, this.dbIdAndServerName,
                 'transAct(' + this.dbType + ')'
                 + reqId ? 'req-id: ' + reqId : '', false);

            return err
        }
    }

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
    async transCommit(transHandle, reqId) {
        
        try {
            if (this.dbType === DBTYPES.PG && this.pgPool) { 

                await transHandle.query('COMMIT;')
                    .catch(/** @param {*} err */ err => {
                        if (err) throw err
                    })
                    .then(() => {
                        if (transHandle) transHandle.release();
                        return true
                    })
            
            } else if (this.dbType === DBTYPES.MSSQL && this.msPool) {

                transHandle.commit(err => {
                    if (err) throw err
                })
                return true

            } else if (this.dbType === DBTYPES.MARIA && this.myPool) {

                await new Promise((resolve, reject) => {

                    transHandle.query('COMMIT;', 
                        /**
                         * @param {Error} err 
                         */
                        function(err) {
                            if (err) {
                                transHandle.release();
                                reject(false);
                                return false
                            };
                        }
                    );
                    transHandle.release();
                    resolve(true)
                    return true
                })
    
            } else if (this.dbType === DBTYPES.SQLITE && this.sqlite) {

                /** @const {Sqlite3.Statement} sql3Statement */
                const sql3Statement = transHandle.prepare('COMMIT;')

                sql3Statement.run()

                transHandle.close()

                return true

            } else {
                throw new Error('SqlQuest transaction commit: database pool handle undefined')
            }
        } catch (err) {
            logSqlError(err, import.meta.url, this.dbIdAndServerName,
                 'transCommit(' + this.dbType + ')'
                 + reqId ? 'req-id: ' + reqId : '', true);
            
            return err
        }
        return false
    }

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
     * @param {MssqlTransactionTransaction} transHandle
     * @param {string} [reqId] - Request ID or tracking code
     * @returns {Promise<boolean|Error>} 
     * 
     * @overload 
     * @param {MariaPoolConnectionPoolConnection} transHandle
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
    async transRollback(transHandle, reqId) {
        
        try {
            if (this.dbType === DBTYPES.PG && this.pgPool) {
                
                await transHandle.query('ROLLBACK;')
                    .catch(/** @param {*} err */ err => {
                        if (err) throw err
                    })
                    .then(() => {
                        if (transHandle) transHandle.release();
                        return true
                    })
                
            } else if (this.dbType === DBTYPES.MSSQL && this.msPool) {
                
                transHandle.rollback(/** @param {*} err */ err => {
                    if (err) throw err
                })

                return true

            } else if (this.dbType === DBTYPES.MARIA && this.myPool) {

                await new Promise((resolve, reject) => {

                    transHandle.query('ROLLBACK;', 
                        /**
                         * @param {Error} err 
                         */
                        function(err) {
                            if (err) {
                                reject(err);
                                return false
                            }
                    });
                    transHandle.release();
                    resolve(true);
                    return true
                })
    
            } else if (this.dbType === DBTYPES.SQLITE && this.sqlite) {

                /** @const {Sqlite3.Statement} sql3Statement */
                
                const sql3Statement = transHandle.prepare('ROLLBACK;')

                sql3Statement.run()
                
                transHandle.close()

                return true

            } else {
                throw new Error('SqlQuest transaction rollback: database pool handle undefined')
            }
        } catch (err) {
            logSqlError(err, import.meta.url, this.dbIdAndServerName, 
                'transRollback(' + this.dbType + ')'
                + reqId ? 'req-id:' + reqId : '', true);
            
            return err
        }
        return false
    }

/** SQL Injection methods */

    /**
     * @method sqlString - Prepare a string for SQL injection
     * @param {string|Buffer|number|boolean|undefined} strText - Thing to prepare
     * @param {boolean} [nullIfBlank] - Optional 'NULL' string literal if string is empty
     * @returns {string} SQL safe string
     */
    sqlString(strText, nullIfBlank) {

        if (typeof strText === 'string') {
            if (nullIfBlank && strText === '') {
                return 'NULL'
            } else {
                return sqlSafeString(strText, this.dbType)
            }
        }

        if (strText instanceof Buffer) {
            return this.sqlString(strText.toString('utf-8'), nullIfBlank)
        }

        if (typeof strText === 'number') { 
            /** @type {string} */
            let n = strText.toPrecision(5);
            if (n.indexOf('e')) {
                if (n.indexOf('e-')) {
                    return `'` + strText.toFixed(9) + `'`
                } else {
                    return `'` + strText.toFixed(0) + `'`
                }
            } else { 
                return `'` + n + `'`
            }
        }
    
        if (typeof strText === 'boolean') {
            if (strText) {
                return `'1'`
            } else {
                return `'0'`
            }
        }
        
        return 'NULL'
    }    

    /**
     * @method sqlDouble - Prepare a double float for SQL injection
     * @param {number} dblNumber - Number to convert to string
     * @returns {string} SQL ready string
     */
    sqlDouble(dblNumber) {

        if (typeof dblNumber !== 'number' || Number.isNaN(dblNumber)) {
            return 'NULL';
        };
    
        /** @type {string} */
        let n = dblNumber.toPrecision();
    
        if (n.indexOf('e')) {

            if (n.indexOf('e-')) {
                n = dblNumber.toFixed(9)
            } else {
                n = dblNumber.toFixed(0)
            };

            if (n) {
                return n
            } else {
                return 'NULL'
            }
        } else { 
            return n
        }
    }    

    /**
     * @method sqlFixed - Create a fixed point string from floating point number
     * @param {number} dblNumber - Number to convert
     * @param {number} decimals - Decimals to simulate
     * @returns {string} SQL ready string
     */
    sqlFixed(dblNumber, decimals) {

        if (typeof dblNumber !== 'number' || Number.isNaN(dblNumber)) {
            return 'NULL'
        };
    
        /** @type {string} */
        let n = dblNumber.toFixed(decimals);
        if (n) {
            return n
        } else {
            return 'NULL'
        }
    }    

    /**
     * @method sqlInteger - Prepare an integer for SQL injection
     * @param {number} aNumber - Number to convert to string
     * @returns {string} SQL ready string
     */
    sqlInteger(aNumber) {

        if (typeof aNumber !== 'number' || Number.isNaN(aNumber)) {
            return 'NULL';
        };

        /** @type {string} */
        let n = aNumber.toFixed(0);
        if (n) {
            return n
        } else {
            return 'NULL'
        }
    }
    
    /**
     * @method sqlBoolean - Prepare a T/F value for SQL injection
     * @param {boolean} aValue - Number to convert to string
     * @returns {string} SQL ready string
     */
    sqlBoolean(aValue) {

        if (aValue) {
            return '1'
        };
        return '0'
    }
}