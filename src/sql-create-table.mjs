/**
 * @file Create SQL table using JSON schema
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlCreateDatabaseTables - JSON schemas in, database tables out
 */

/** @typedef {import('../schemas/jsonSchema.mjs').jsonSchema} jsonSchemaDef */

import SqlQuest from './SqlQuest.mjs';

/**
 * @async
 * @function sqlCreateTable - Create an SQL table using JSON schema data
 * @param {jsonSchemaDef} jsonSchema 
 * @param {SqlQuest} sqlQuest 
 * @param {string} [owner] - Likely 'dbo.', in the case of mssql
 * @returns {Promise<number>} - SQL EXECUTE result ( < 0 indicates error)
 */
export default async function sqlCreateTable(jsonSchema, sqlQuest, owner) {

    let createTable = "CREATE TABLE " + (owner ? owner : "") + jsonSchema.sqlTableName 
        + "(";

    let columns = "";

    Object.keys(jsonSchema.properties).forEach(key => {

        /** @type {import('../schemas/jsonSchema.mjs').jsonSchemaProperty} */
        let colData = jsonSchema.properties[key];

        if (colData.sqlDataType) {

            let nativeDataType = sqlQuest.sqlDataTypes[colData.sqlDataType];

            if (nativeDataType) {

                if (columns) { columns += "," };

                columns += colData.sqlColumnName + " " + nativeDataType;

                if (colData.sqlDataType === "varchar") {
                    /** Add length */
                    if (colData.maxLength) {
                        columns += "(" + colData.maxLength.toString().trim() + ")";
                    } else {
                        columns += "(max)"
                    };

                } else if (colData.sqlDataType === "decimal") {
                    /** Add precision and decimals */
                    if (colData.decimals && colData.decimals > 0 && colData.decimals < 9) {
                        columns += "(18," + colData.decimals.toFixed(0) + ")";
                    } else {
                        columns += "(18,5)";
                    }
                    
                };
        
                if ( ! colData.nullable) {
                    columns += " NOT NULL"
                };
            };
        };
    });

    /** Assemble primary key constraint, if present */
    if (jsonSchema.sqlPrimaryKey && jsonSchema.sqlPrimaryKey.length > 0) {

        let keyCols = "";

        jsonSchema.sqlPrimaryKey.forEach(colId => {

            if (keyCols) { keyCols += "," };

            keyCols += jsonSchema.properties[colId].sqlColumnName;
        });

        if (keyCols) {
            columns += ",CONSTRAINT pk_" + jsonSchema.sqlTableName 
                + " PRIMARY KEY (" + keyCols + ")";
        };
    };
    return await sqlQuest.execute( createTable + columns + ")" );
};
