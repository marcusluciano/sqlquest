/**
 * @file Delete and insert detail record array into an SQL table
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlTablePut - Delete and then insert SQL detail records
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
 * @function sqlTablePut - Delete and then insert array of row objects into SQL table
 * @param {Array<Object<string,*>>} dataArr - The records to be written
 * @param {Array<string>} keyArr - The SQL primary keys of the object that owns this detail record array
 * @param {jsonSchema} schema - The JSON Schema for this table
 * @param {Path} path - Path object for this detail recordset
 * @param {SqlQuest} sqlQuest - SqlQuest connection pool to del/ins with
 * @param {User} user - The User attempting to delins
 * @returns {Promise<[*|null, number]>} - Returns [Error|null, result]
 */
export default async function sqlTablePut(dataArr, keyArr, schema, path, sqlQuest, user) {

    if ( ! schema.sqlPrimaryKey || schema.sqlPrimaryKey.length < 1) {
        return [new Error(import.meta.url + errMessages.schemaMissingPK), errValues.keyParameterMissing]
    };

    if ( ! keyArr || keyArr.length < 1) {
        return [new Error(import.meta.url + errMessages.noKeyProvided), errValues.keyParameterMissing]
    };

    if (path.metaobjtyp) {
        if ( ! hasWritePermission(sqlQuest, user, path.metaobjtyp, keyArr[0], false)) {
            return [new Error(import.meta.url + errMessages.permissionDenied), errValues.noPermission]
        };
    };

    try {

        let sql = "DELETE FROM " + schema.sqlTableName + " WHERE " 
            + schema.sqlPrimaryKey[0] + "=" 
            + sqlQuest.sanitize(keyArr[0], 
                schema.properties[schema.sqlPrimaryKey[0]].sqlDataType);
        
        for (let index = 1; index < schema.sqlPrimaryKey.length; index++) {
            if (index < keyArr.length) {
                sql += " AND " + schema.sqlPrimaryKey[index] + "=" 
                + sqlQuest.sanitize(keyArr[index], 
                    schema.properties[schema.sqlPrimaryKey[index]].sqlDataType);
            };
        };

        /** @type {number} */
        let recordsInserted = 0;

        if (await sqlQuest.execute(sql) >= 0) { // Delete went OK

            /** @type {string} */
            let insert = ""; 
            
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

                        if (sql) { sql += ","};
                        
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
            }
        } else {
            console.log (import.meta.url + ": DELETE FROM " 
                + path.tableName + " failed, sql=" + sql);

            return [new Error(errMessages.deleteFailed), errValues.deleteFailed];
        }
    } catch (err) {
        
        return [err, errValues.unknown]
    };
};
  