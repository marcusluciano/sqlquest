/**
 * @file Insert detail record array into an SQL table
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlRecordsInsert - Insert SQL detail records
 */

/** @typedef {import('../schemas/jsonSchema.mjs').jsonSchema} jsonSchema */

import SqlQuest from './SqlQuest.mjs';

import { hasWritePermission } from '../lib/sql-permissions.mjs';

import Path from '../router/objects/Path.mjs';

import User from '../router/objects/User.mjs';

import errMessages from '../locale/app-errors.json' assert { type: 'json' };

import errValues from './sql-error-values.mjs';

/**
 * @async
 * @function sqlRecordsInsert - Insert array of row objects into SQL table
 * @param {Array<Object<string,*>>} dataArr - The records to be written
 * @param {jsonSchema} schema - The JSON Schema for this table
 * @param {SqlQuest} sqlQuest - SqlQuest connection pool to del/ins with
 * @param {User} [user] - For creating metaTable records (typically parents only)
 * @param {Path} [path] - Path object if metaObjectType is being honored on this path 
 * @param {Array<string>} [keyArr] - The SQL primary keys of objec
 * 
 * @returns {Promise<[*|null, number]>} - Returns [Error|null, result]
 */
export default async function sqlRecordsInsert(dataArr, schema, sqlQuest, user, path, keyArr) {

    if (user && path && path.metaobjtyp && keyArr) {
        /** Create metaTable records if this is a parent recordset */
        if ( ! hasWritePermission(sqlQuest, user, path.metaobjtyp, keyArr[0], false)) {
            return [new Error(import.meta.url + errMessages.permissionDenied), errValues.noPermission]
        };
    };

    try {

        /** @type {number} */
        let recordsInserted = 0;

        /** @type {string} */
        let insert = ""; 
        
        /** @type {string} */
        let sql = "";

        Object.keys(schema.properties).forEach(colKey => {

            if (insert) { insert += "," };

            insert += sqlQuest.enclose(schema.properties[colKey].sqlColumnName);
        });

        insert = "INSERT INTO " + schema.sqlTableName 
            + "(" + insert + ") VALUES (";

        if (Array.isArray(dataArr)) {
            
            dataArr.forEach(async detailRow => {
                
                sql = "";

                Object.keys(schema.properties).forEach(colKey => {

                    if (sql) { sql += "," };
                    
                    if (schema.properties[colKey].sqlDataType) {
                        sql += sqlQuest
                            .sanitize(detailRow[colKey], 
                                schema.properties[colKey].sqlDataType);
                    } else {
                        sql += "NULL"
                    };
                });

                recordsInserted += await sqlQuest.execute( insert + sql + ")" );

            });
            /** Success */
            return [null, recordsInserted];

        } else {
            console.log (import.meta.url + ": dataArr is not an array. Type=" 
                + typeof dataArr);

            return [new Error(errMessages.insertFailed), errValues.arrayExpected];
        };
    } catch (err) {
        
        return [err, errValues.unknown]
    };
};
  