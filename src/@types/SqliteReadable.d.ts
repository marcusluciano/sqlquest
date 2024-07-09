/**
 * @typedef sqliteReadableParams
 * @prop {string} sql
 * @prop {import('sqlite3').Database} db
 * @prop {number} highWaterMark
 */
/**
 * @class
 * @constructs SqliteReadable - Readable stream for Sqlite via statement.get
 * @extends Readable
 * @prop {import('sqlite3').statement} statement
 */
export default class SqliteReadable extends Readable {
    /**
     * @constructor
     * @param {sqliteReadableParams} sqlAndDb
     */
    constructor(sqlAndDb: sqliteReadableParams);
    /** @type {import('sqlite3').Statement} */ statement: import("sqlite3").Statement;
    _read(): void;
}
export type sqliteReadableParams = {
    sql: string;
    db: import("sqlite3").Database;
    highWaterMark: number;
};
import { Readable } from 'node:stream';
