/**
 * @fileoverview Sqlite3 readable stream
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @classdesc Sqlite3 readable stream
 * 
 * @exports SqliteReadable() - npm sqlite3 V5.0.0 and up
 */

import { Readable } from 'node:stream';

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

    /** @type {import('sqlite3').Statement} */ statement;

    /**
     * @constructor
     * @param {sqliteReadableParams} sqlAndDb 
     */
    constructor(sqlAndDb) {

        super({ objectMode: true, highWaterMark: sqlAndDb.highWaterMark });

        this.statement = sqlAndDb.db.prepare(sqlAndDb.sql);

        this.on('end', () => this.statement.finalize())
    }

    _read() {

        let sqliteReadable = this;

        sqliteReadable.statement.get(
            
            function (err, result) {

                err ? sqliteReadable.emit('error', err)
                    : sqliteReadable.push(result || null);
            }
        )
    }
}
