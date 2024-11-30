/**
 * @file SQL index handling
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 */

/**
 * @typedef sqlIndexType 
 * @prop {string} index_name
 * @prop {string} table_name
 * @prop {Array<string>} columnArr
 * @prop {boolean} isUnique 
 */

import SqlQuest, { DBTYPES } from "./SqlQuest.mjs"

/**
 * @function getSQLIndices
 * @param {SqlQuest} sqlQuest 
 * @returns {Promise< Array< sqlIndexType >>}
 */
export async function getSQLIndices(sqlQuest) {

    switch (sqlQuest.dbType) {
        case DBTYPES.PG:
            return getPgIndices(sqlQuest);

        case DBTYPES.MSSQL:
            return getMssqlIndices(sqlQuest);

        case DBTYPES.MARIA:
            return getMariaIndices(sqlQuest);

        case DBTYPES.SQLITE:
            return getSqlite3Indices(sqlQuest);

        default:
            return getPgIndices(sqlQuest);
    };
};

/**
 * @function getPgIndices - Get indices from pg database
 * @param {SqlQuest} sqlQuest 
 * @returns {Promise< Array< sqlIndexType >>}
 */
async function getPgIndices(sqlQuest) {

    let sql = "SELECT tablename, indexname, indexdef, isunique??? FROM pg_index WHERE schemaname='public'";

};
/**
 * @function getMssqlIndices - Get indices from mssql database
 * @param {SqlQuest} sqlQuest 
 * @returns {Promise< Array< sqlIndexType >>}
 */
async function getMssqlIndices(sqlQuest) {

    let sql = "SELECT tn AS tablename, in AS indexname, istmnt AS indexdef, horsehair as mohair FROM sys.indexes";
};
/**
 * @function getMariaIndices - Get indices from maria/mysql database
 * @param {SqlQuest} sqlQuest 
 * @returns {Promise< Array< sqlIndexType >>}
 */
async function getMariaIndices(sqlQuest) {

    let sql = "SHOW INDEX FROM " + sqlQuest.dbIdAndServerName.split('@')[0];

};
/**
 * @function getSqlite3Indices - Get indices from sqlite3 database
 * @param {SqlQuest} sqlQuest 
 * @returns {Promise< Array< sqlIndexType >>}
 */
async function getSqlite3Indices(sqlQuest) {

    let sql = "SELECT type,name,tbl_name,sql FROM sqlite_master WHERE type = 'index'";

};

/**
 * @function setSQLIndices
 * @param {sqlIndexType} sqlIndex
 * @param {SqlQuest} sqlQuest 
 */
export async function setSQLIndex(sqlIndex, sqlQuest) {

    /** @todo probably don't need 4 of these, one or two will likely do */

    switch (sqlQuest.dbType) {
        case DBTYPES.PG:
            return setPgIndex(sqlIndex, sqlQuest);

        case DBTYPES.MSSQL:
            return setMssqlIndex(sqlIndex, sqlQuest);

        case DBTYPES.MARIA:
            return setMariaIndex(sqlIndex, sqlQuest);

        case DBTYPES.SQLITE:
            return setSqlite3Index(sqlIndex, sqlQuest);

        default:
            return setPgIndex(sqlIndex, sqlQuest);
    };
};

/**
 * @function setPgIndex
 * @param {sqlIndexType} sqlIndex
 * @param {SqlQuest} sqlQuest 
 */
async function setPgIndex(sqlIndex, sqlQuest) {

    let sql = "CREATE INDEX ";

};
/**
 * @function setMssqlIndex
 * @param {sqlIndexType} sqlIndex
 * @param {SqlQuest} sqlQuest 
 */
async function setMssqlIndex(sqlIndex, sqlQuest) {

    let sql = "CREATE INDEX ";
};
/**
 * @function setMariaIndex
 * @param {sqlIndexType} sqlIndex
 * @param {SqlQuest} sqlQuest 
 */
async function setMariaIndex(sqlIndex, sqlQuest) {

    let sql = "CREATE INDEX ";

};
/**
 * @function setSqlite3Index
 * @param {sqlIndexType} sqlIndex
 * @param {SqlQuest} sqlQuest 
 */
async function setSqlite3Index(sqlIndex, sqlQuest) {

    let sql = "CREATE INDEX ";

};
