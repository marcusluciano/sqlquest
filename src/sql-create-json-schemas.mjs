/**
 * @file Create JSON schema file from an existing SQL 'information_schema'.
 * Info schema data must be available and query-able
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlCreateJSONSchemas - Database in, JSON Schema out (one file per table)
 * AND/OR Create a typedef for the tables in the database
 */ 

/**
 * @typedef {import('./sql-info-schema-queries.mjs').sqlTable} sqlTable
 */
import { sqlTablesQuery } from './sql-info-schema-queries.mjs';

import sqlCreateSchemaAndTypes from './sql-create-schema-and-types.mjs';

import SqlQuest from './SqlQuest.mjs';

import pLimiter from '../lib/p-limiter.mjs';

/**
 * @async
 * @function sqlCreateJSONSchemas - Create a JSON schema file for each 
 * table in this database.  Save on path schemaPath.
 * @param {SqlQuest} sqlQuest - Database connection for schema extraction (must be open)
 * @param {string} [schemaPath] - File path if JSON schema output
 * @param {string} [typedefPath] - File path if JSDoc typedef output 
 * @param {string} [tsTypePath] - File path if TypeScript type declaration
 */
export default async function sqlCreateJSONSchemas(sqlQuest, schemaPath, typedefPath, tsTypePath) {

    /** @const {Array<sqlTable>} rsTables */
    const rsTables = await sqlQuest.query(sqlTablesQuery);
    
    /** @type {Array<*>} */
    let promiseArr = [];

    rsTables.forEach(table => {

        promiseArr.push(
            pLimiter(async () => {
                await sqlCreateSchemaAndTypes(
                    table, sqlQuest, schemaPath, typedefPath, tsTypePath)
            })
        );
    });

    await Promise.allSettled(promiseArr);
};
