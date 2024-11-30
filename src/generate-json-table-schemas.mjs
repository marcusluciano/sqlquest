/**
 * @file Create JSON schema files from an existing database
 * using SQL 'information_schema'.  Each table gets its own file.
 * Existing files will be overwritten.  Also outputs JSDoc and
 * TypeScript types if output paths are given.
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 */ 

import sqlCreateJSONSchemas from './sql-create-json-schemas.mjs';

import SqlQuest, { DBSTATE } from './SqlQuest.mjs';

import dbConfig from './config-mssql.json' assert { type: 'json' };

const sqlQuest = new SqlQuest(dbConfig);

/** Open database */
try {
    if ( ! await sqlQuest.dbOpen()) {
        console.log("Database did not open");
        process.exit(3);
    };
} catch (err) {
    console.log("Error opening ./config database:" + JSON.stringify(err, null, 4));
    if (sqlQuest.dbState !== DBSTATE.OPEN) {
        process.exit(101)
    };
};

console.log("Generating JSON Schema/TS Types/JSDoc types");

console.log(await sqlQuest.query("SELECT CoName FROM Company"));

let schemaPath = process.env.JSONSCHEMAPATH || '/home/marcus/fm-api/src/schemas/tables';
let jsDocPath = process.env.JSDOCPATH || '/home/marcus/fm-api/src/@types/js-tables';
let tsTypePath = process.env.TSTYPEPATH || '/home/marcus/fm-api/src/@types/ts-tables';

process.env.NO_JSONSCHEMA ? schemaPath = '' : console.log("Include JSON schema");
process.env.NO_JSDOCDEF ? jsDocPath = '' : console.log("Include JSDoc typeDef");
process.env.NO_TSTYPE ? tsTypePath = '' : console.log("Include TS type defs");

try {
    console.log("Creating schemas");

    await sqlCreateJSONSchemas(sqlQuest,
        schemaPath, 
        jsDocPath,
        tsTypePath
    );
    console.log("Schema creation complete");
    
} catch (err) {
    console.log( import.meta.url + " Error calling sqlCreateJSONSchemas():" 
        + JSON.stringify(err, null, 4));
};

try {
    await sqlQuest.dbClose();
} catch (err) {
    console.log( import.meta.url + " Error closing database:" 
        + JSON.stringify(err, null, 4));
};
