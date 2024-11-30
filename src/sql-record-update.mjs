/**
 * @file Update SQL record. Note that primary key column[0] is never updated in this module.
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlRecordUpdate - Update SQL record
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
 * @function sqlRecordUpdate - Update a record in an SQL table. Primary key MUST be included in dataRow
 * @param {Object<string,*>} dataRow - The data to be written to the record
 * @param {jsonSchema} schema - The JSON Schema for this table
 * @param {Path} path - Path object for this detail recordset
 * @param {SqlQuest} sqlQuest - SqlQuest connection pool to update
 * @param {User} user - The User attempting to update
 * @param {string|number} [primaryKeyValue] - If not included in dataRow
 * @returns {Promise< [*|null, number] >} - Returns [Error|null, result]; result < 0 indicates sql error value
 */
export default async function sqlRecordUpdate(dataRow, schema, path, sqlQuest, user, 
    primaryKeyValue) {

    if (schema.sqlPrimaryKey && schema.sqlPrimaryKey.length > 0){

        let keyColumName = schema.sqlPrimaryKey[0];

        if ( ! dataRow[keyColumName] || ! primaryKeyValue) {
            return [new Error(errMessages.badCodeOrKey), errValues.keyParameterMissing];
        };

        let pKey;
        if (primaryKeyValue) { 
            pKey = primaryKeyValue 
        } else {
            pKey = dataRow[keyColumName];
        };
        if (path.metaobjtyp) {
            if ( ! hasWritePermission(sqlQuest, user, path.metaobjtyp, 
                pKey, false)) {
                    return [new Error(import.meta.url 
                        + errMessages.permissionDenied), errValues.noPermission]
            };
        };

        /** @type {string} */
        let update = "UPDATE " + schema.sqlTableName + " SET ";

        /** @type {string} */
        let sql = "";

        Object.keys(schema.properties).forEach(colName => {

            let key = colName.toLowerCase();

            if (dataRow[key]) {

                if (sql) { sql += "," };    

                if (schema.properties[key].sqlDataType
                    && key !== keyColumName ) {
                    /** Note that you can include the primary key column, 
                     * but it is not updated!!! */
                    sql += sqlQuest.enclose(colName) + "=" 
                        + sqlQuest.sanitize(dataRow[key], 
                            schema.properties[key].sqlDataType)
                };
            };
        });

        /** @type {string} */
        let where = " WHERE " + keyColumName + "=" 
            + sqlQuest.sanitize(pKey, 
                schema.properties[keyColumName].sqlDataType);

        if ( sql ) {
            return [null, await sqlQuest.execute(update + sql + where)];

        } else {
            return [new Error(errMessages.noColumnsInPath) , errValues.updateFailed]
        };
    } else {
        return [new Error(errMessages.schemaMissingPK) , errValues.keyParameterMissing]
    };
};
