/**
 * @file SQL column data types, by database
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 */

/** Internal data type keys
 * @typedef sqlDataTypes
 * @property {string} boolean
 * @property {string} int8
 * @property {string} int16
 * @property {string} int32
 * @property {string} int64
 * @property {string} float32
 * @property {string} float64
 * @property {string} decimal
 * @property {string} varchar
 * @property {string} text
 */

/**
 * @const {sqlDataTypes} pgDataTypes
 * @const {sqlDataTypes} mssqlDataTypes
 * @const {sqlDataTypes} mariaDataTypes
 * @const {sqlDataTypes} sqliteDataTypes
 */

export const pgDataTypes = {
    boolean: "boolean",
    int8: "tinyint",
    int16: "smallint",
    int32: "int",
    int64: "bigint",
    float32: "real",
    float64: "float",
    decimal: "decimal",
    varchar: "varchar",
    text: "bpchar",
};

export const mssqlDataTypes = {
    boolean: "bit",
    int8: "tinyint",
    int16: "smallint",
    int32: "int",
    int64: "bigint",
    float32: "real",
    float64: "float",
    decimal: "decimal",
    varchar: "nvarchar",
    text: "ntext",
};

export const mariaDataTypes = {
    boolean: "bit",
    int8: "tinyint",
    int16: "smallint",
    int32: "int",
    int64: "bigint",
    float32: "float",
    float64: "double",
    decimal: "decimal",
    varchar: "varchar",
    text: "mediumtext",
};

export const sqliteDataTypes = {
    boolean: "boolean",
    int64: "integer",
    int32: "integer",
    int16: "integer",
    int8: "integer",
    float32: "float",
    float64: "double",
    decimal: "decimal",
    varchar: "varchar",
    text: "text",
};

/** 
 * Reverse look-up: given dbType and SQL column data type, return
 * the "standard" internal SQL data type
   @const {Object<string,Object<string,string>>} lookupTypeByDB */

const lookupTypeByDB = {
    pg: {
        boolean: "boolean",
        bit: "boolean",
        tinyint: "int8",
        smallint: "int16",
        int: "int32",
        bigint: "int64",
        real: "float32",
        float: "float64",
        double: "float64",
        decimal: "decimal",
        varchar: "varchar",
        text: "text",
    },
    mssql: {
        boolean: "boolean",
        bit: "boolean",
        tinyint: "int8",
        smallint: "int16",
        int: "int32",
        bigint: "int64",
        real: "float32",
        float: "float64",
        double: "float64",
        decimal: "decimal",
        varchar: "varchar",
        nvarchar: "varchar",
        text: "text",
        ntext: "text",
    },
    mysql2: {
        boolean: "boolean",
        bit: "boolean",
        tinyint: "int8",
        smallint: "int16",
        int: "int32",
        bigint: "int64",
        real: "float32",
        float: "float32",
        double: "float64",
        decimal: "decimal",
        varchar: "varchar",
        text: "text",
    },
    sqlite3: {
        boolean: "boolean",
        bit: "boolean",
        tinyint: "int8",
        smallint: "int16",
        int: "int32",
        bigint: "int64",
        real: "float32",
        float: "float32",
        double: "float64",
        decimal: "decimal",
        varchar: "varchar",
        text: "text",
    }
};

/**
 * @function lookupSchemaSqlDataType - create-json-schemas needs this to determine 
 * internal data type given sqldb schema query data type
 * @param {import ('./SqlQuest.mjs').DBTYPES} dbType - sqlQuest.dbType
 * @param {string} dataTypeValue - from sqlColumnsQuery, typically
 * @returns {string}
 */
export function lookupSchemaSqlDataType(dbType, dataTypeValue) {
    // @ts-ignore
    return lookupTypeByDB[dbType][dataTypeValue] || dataTypeValue;
};
