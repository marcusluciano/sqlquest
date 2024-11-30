/**
 * @file Create SQL database tables using JSON schema files
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlCreateDatabaseTables - JSON schemas in, database tables out
 */

/** @typedef {import('./schemas/jsonSchema.mjs').jsonSchema} jsonSchema */

import sqlCreateTable from './sql-create-table.mjs';

import SqlQuest from './SqlQuest.mjs';

import pLimiter from './lib/p-limiter.mjs';

import fs from 'node:fs';

/**
 * @async
 * @function sqlCreateSqlTables - Create db tables using JSON schemas
 * @param {SqlQuest} sqlQuest - Database connection for schema creation (must be open)
 * @param {string} [schemaPath] - File path of the JSON schemas directory
 * @param {string} [owner] - Likely 'dbo.', in the case of mssql
 */
export default async function sqlCreateSqlTables(sqlQuest, schemaPath, owner) {

    if ( ! schemaPath) { schemaPath = '../schemas/tables' };

    fs.readdir(schemaPath, async (err, files) => {
        
        if (err) {
            console.error(import.meta.url, "Error reading directory:", err);
            return;
        };
        
        /** @type {Array<*>} */
        let promiseArr = [];

        files.forEach(schemaFile => {
            console.log(`Processing ${schemaFile}`);

            /** @type {jsonSchema|undefined} */
            let jsonSchema;

            try {
                jsonSchema = JSON.parse(schemaFile);

            } catch (err) {
                console.error(import.meta.url, 
                    "Error parsing JSON schema file ", schemaFile, ":", err)
            };

            if (jsonSchema && jsonSchema.$id && jsonSchema.properties) {
                promiseArr.push(
                    pLimiter(async () => {
                        await sqlCreateTable(jsonSchema, sqlQuest, owner)
                    })
                );
            };
        });

        await Promise.allSettled(promiseArr);
    });
};
