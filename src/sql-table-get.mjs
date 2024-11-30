/**
 * @file Query SQL database for using a table's JSON Schema as query source
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlGet
 * @exports sqlGet - Returns object based on JSON schema
 */

/** @typedef {import('../schemas/jsonSchema.mjs').jsonSchema} jsonSchemaType*/

import SqlQuest from './SqlQuest.mjs';

import User from '../router/objects/User.mjs';

/**
 * @async @function sqlTableGet() - Query table using JSON schema
 * @param {Array<string>} keyArr - Array of keys to fetch
 * @param {jsonSchemaType} jsonSchema - Table to query
 * @param {SqlQuest} sqlQuest - Database connection to query from
 * @param {User} [user] - User requesting data
 * @param {string} [metaId] - Meta table Id
 * @returns {Promise<Array<*>>} - Array of row objects per schema
 */
export default async function sqlTableGet(keyArr, jsonSchema, sqlQuest, user, metaId) {

    if (keyArr[0] && jsonSchema.sqlPrimaryKey && jsonSchema.sqlPrimaryKey[0]) {

        /** Build SQL columns into query */
        let sql = "";

        Object.keys(jsonSchema.properties).forEach(property => {

            if (jsonSchema.properties[property].sqlColumnName) {

                if (sql) { sql += "," };

                sql += sqlQuest.enclose(jsonSchema.properties[property].sqlColumnName)
                    + " AS " + sqlQuest.enclose(property);
            };
        });

        /** @type {keyof jsonSchemaType["properties"]} */
        let keyColumnName = 
            jsonSchema.properties[jsonSchema.sqlPrimaryKey[0]].sqlColumnName;

        /** Build WHERE clause for each element of keyArr */
        let where = " WHERE "; // WHERE key='a' OR key='b' OR...
        
        let metaWhere = "";

        let join = "";

        if (metaId) {
            join = " INNER JOIN metatable ON "
                + jsonSchema.sqlTableName + "." + keyColumnName + "=metatable.objcode";

            /** POSIX style permissions table i.e. rwx-rwx-rwx */
            metaWhere = ' WHERE (metatable.objtyp=' + sqlQuest.sqlString(metaId) 
                + " AND ((metatable.objown=" + sqlQuest.sqlString(user?.userId) 
                + " AND metatable.ownperms&4) OR (metatable.objgrp IN " + user?.usrGrpSqlList
                + " AND metatable.grpperms&4) OR metatable.pubperms&4))"
                + " AND ";

            where = "";
        };

        for (let index = 0; index < keyArr.length; index++) {

            if (jsonSchema.sqlPrimaryKey.length < index) {

                where += (where) ? " OR " : "";
    
                where += sqlQuest.enclose(keyColumnName) + "="
                    + sqlQuest.sanitize(keyArr[index], 
                        jsonSchema
                        .properties[jsonSchema.sqlPrimaryKey[0]].sqlDataType);
            };
        };

        if (where === "") {
            /** Remove trailing " AND " from metaWhere */
            metaWhere = metaWhere.slice(0, metaWhere.length - 4)
        };

        let orderBy = "";

        if (jsonSchema.sqlPrimaryKey.length > 1 
            && keyArr.length < jsonSchema.sqlPrimaryKey.length) {
                /** Order by the first unspecified primary key column */
                orderBy = " ORDER BY " 
                    + jsonSchema.sqlPrimaryKey[keyArr.length];
        };

        /** Return the query data */
        return await sqlQuest.query(
            "SELECT " + sql + " FROM " 
                + jsonSchema.sqlTableName 
                + join + metaWhere + where + orderBy );

    } else {
        return [];
    };
};
