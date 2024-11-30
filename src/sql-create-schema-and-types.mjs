/**
 * @file Create JSON schema files from an existing database
 * via SQL 'information_schema'.  Data must be available and query-able.
 * Also create table JSDoc typedef tableName  in src/@types/js-tables
 * Also create table TSType typedef tableName  in src/@types/ts-tables
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlCreateSchemaAndTypes - Create JSON schema for this table
 */ 

/** @typedef {import('../schemas/jsonSchema.mjs').jsonSchema} jsonSchema */
/**
 * @typedef {import('./sql-info-schema-queries.mjs').sqlTable} sqlTable
 * @typedef {import('./sql-info-schema-queries.mjs').sqlColumn} sqlColumn
 * @typedef {import('./sql-info-schema-queries.mjs').sqlKeyConstraint} sqlKeyConstraint
 */
/** 
 * One to N relationships become properties of the 'One' via absolute path $refs 
 * in the JSON schema
*/
/** Part: children relationships */
import relations from '../schemas/parent-relations.json' assert { type: 'json' };

import { sqlColumnsQuery, sqlKeyConstraintQuery } from './sql-info-schema-queries.mjs';

import SqlQuest from './SqlQuest.mjs';

/** Map native types to internal SQL types */
import { lookupSchemaSqlDataType } from './sql-data-types.mjs';

import { writeFile } from 'node:fs/promises';

const rootPath = process.env.SCHEMA_HTTP_PATH || "https://formulatorus.com/tables/";

const schemaVersion = process.env.SCHEMA_VERSION || "https://json-schema.org/draft/2020-12/schema";

/**
 * @async
 * @function sqlCreateSchemaAndTypes - Create a JSON schema file for this table
 * @param {sqlTable} table - One information_schema.tables record
 * @param {SqlQuest} sqlQuest - Database connection for schema extraction (must be open)
 * @param {string} [schemaPath] - File path for JSON schema output 
 * @param {string} [typedefPath] - File path for JSDoc typedef declaration
 * @param {string} [tsTypePath] - File path for TypeScript type declaration
 */
export default async function sqlCreateSchemaAndTypes(table, sqlQuest, 
        schemaPath, typedefPath, tsTypePath) {

    let tableKey = table.table_name.toLowerCase();

    /** @type {string} *///JSDoc typeDef
    let typeDef = "/**\n * @typedef " + tableKey;

    /** @type {string} *///TypeScript type
    let tsType = "export type " + tableKey + " = {\n";

    /** @type {jsonSchema} */// JSON Schema V7
    const jsonTableSchema = {
        "$id":  rootPath + tableKey,
        "$schema": schemaVersion, 
        "type": "object",
        "description": table.table_name,
        "sqlTableName": table.table_name,
        "sqlPrimaryKey": [],
        "required": [],
        "properties": {},
    };
    
    /** Add 1:N relationships */// @ts-ignore
    if (relations[tableKey]) { // @ts-ignore

        jsonTableSchema.properties = {...relations[tableKey]};

        // @ts-ignore
        Object.keys(relations[tableKey]).forEach(relation => {
            tsType += "\t" + relation + `: [ import("./` + relation + `").` + relation + " ];\n";
        });

        // @ts-ignore
        Object.keys(relations[tableKey]).forEach(childTable => {
            typeDef += "\n * @prop {Array<import('./"
            + childTable + ".mjs')." 
            + childTable + ">} " 
            + childTable;
        });
    };

    /** Add data columns */
    /** @const {Array<sqlColumn>} rsColumns */
    const rsColumns = await sqlQuest.query(sqlColumnsQuery
        + " WHERE table_name=" 
        + sqlQuest.sqlString(table.table_name)
        + " ORDER BY ordinal_position");

    rsColumns.forEach(column => {
        
        let sqlDataType = lookupSchemaSqlDataType(sqlQuest.dbType, column.data_type);

        let jsDocNull = "";
        let tsTypeNull = "";

        if (column.is_nullable.toUpperCase() !== "NO") {
            jsDocNull = "|null"
            tsTypeNull = " | null"
        };

        switch (sqlDataType) {

            case "boolean":


                typeDef += "\n * @prop {boolean" + jsDocNull + "} " + column.column_name.toLowerCase();

                tsType += "\t" + column.column_name.toLowerCase() + ": boolean" + tsTypeNull + ";\n";

                addTableProperty(jsonTableSchema, column, "boolean", sqlDataType); 

                break;

            case "varchar":
            case "text":

                typeDef += "\n * @prop {string" + jsDocNull + "} " + column.column_name.toLowerCase();

                tsType += "\t" + column.column_name.toLowerCase() + ": string" + tsTypeNull + ";\n";

                addTableProperty(jsonTableSchema, column, "string", sqlDataType); 

                break;

            case "int8":
            case "int16":
            case "int32":
            case "int64":
            case "float32":
            case "float64":
            case "decimal":

                typeDef += "\n * @prop {number" + jsDocNull + "} " + column.column_name.toLowerCase();

                tsType += "\t" + column.column_name.toLowerCase() + ": number" + tsTypeNull + ";\n";

                addTableProperty(jsonTableSchema, column, "number", sqlDataType);

                break;
            
            default:
                console.log(table.table_name + "." + column.column_name, 
                    "unknown column type", column.data_type, 
                    " dataType=", sqlDataType)
        };
    });

    /** Add key constraint column names to required columns */
    /** @const {Array<sqlKeyConstraint>} rsKeyColumns */
    const rsKeyColumns = await sqlQuest.query(sqlKeyConstraintQuery
        + " WHERE table_name=" 
        + sqlQuest.sqlString(table.table_name)
        + " ORDER BY constraint_name,ordinal_position");
    
    const requiredSet = new Set();

    rsKeyColumns.forEach(key => {
        requiredSet.add(key.column_name);
    });

    requiredSet.forEach(column_name => {
        
        jsonTableSchema.required.push(column_name.toLowerCase());

        if ( ! jsonTableSchema.sqlPrimaryKey) {
            jsonTableSchema.sqlPrimaryKey = [];
        };
        
        jsonTableSchema.sqlPrimaryKey.push(column_name);

    });

    /** Write JSON schema & c. for this table */
    const tableName = table.table_name.toLowerCase();

    if (schemaPath) {
        await writeFile(schemaPath + "/" + tableName + ".json",
            JSON.stringify(jsonTableSchema, null, 4),
            "utf8")
    };

    if (tsTypePath) {
        await writeFile(tsTypePath + "/" + tableName + ".d.ts",
            tsType + "}\n",
            "utf8");
    };

    if (typedefPath) {
        /** 
         * @todo FIGURE OUT WHY we need .mjs for JSDoc table 
         * relations but .js for auto-type pickup in the editor 
         * so we have to output BOTH?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?
         */
        await writeFile(typedefPath + "/" + tableName + ".js",
            typeDef + "\n */\n",
            "utf8");
        await writeFile(typedefPath + "/" + tableName + ".mjs",
            typeDef + "\n */\n",
            "utf8");
        };
};

/**
 * @function addTableProperty - Add a jsonSchemaProperty object to a JSON table schema
 * @param {jsonSchema} jsonTableSchema - JSON schema
 * @param {sqlColumn} column - information_schema.columns query result
 * @param {string} jsonType - 'string', 'number', 'boolean', etc.
 * @param {string} sqlType - 'varchar', 'text', 'int', 'double', etc.
 */
function addTableProperty(jsonTableSchema, column, jsonType, sqlType) {

    try { 
        /** @type {string} */
        let key = column.column_name.toLowerCase(); 

        /** @type {boolean} */
        let nullable = column.is_nullable.toUpperCase() !== "NO";

        let type = [ jsonType ]; 

        if (nullable) { 
            type.push("null") 
        };

        jsonTableSchema.properties[key] = {
            type,
            sqlColumnName: column.column_name,
            sqlDataType: sqlType,
            nullable: nullable
        };

        if (column.character_maximum_length > 0) {
            jsonTableSchema.properties[key].maxLength = column.character_maximum_length;
        };
    
    } catch (err) {
        console.error(import.meta.url 
            + ".addTableProperty() error adding " + sqlType + " column " 
            + JSON.stringify(column) + ": " + JSON.stringify(err));
    };
};
