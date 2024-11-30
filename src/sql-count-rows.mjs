/** 
 * @file sqlCountRows - Counts number of rows that have a given key value
 *
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 * 
 * @module sqlRowCount
 * 
 * @exports @default sqlCountRows
 * 
 * SQL: SELECT COUNT(*) FROM tableName WHERE keyColumnName = searchKeyValue
 */ 

import SqlQuest from './SqlQuest.mjs';

/** Count how many records are on file in a table for a given search key value
 * @async
 * @exports sqlCountRows
 * @param {SqlQuest} sqlQuest - SQL connector to query
 * @param {string} tableName - SQL table name
 * @param {string} keyColumnName - Search column name (hopefully indexed)
 * @param {(string|number)} searchKeyValue - Key value to SELECT WHERE =
 * @param {boolean} [keyIsNumeric] - For numeric keys only
 * @returns {Promise<number>} - Record count; -1 indicates error
 * YOU SHOULD VALIDATE searchKeyValue yourself before calling
 *  if keyIsNumeric === true; checks here are for Number.isNaN ONLY
 * Returns count of record(s) on file
 * Returns 0 for not on file
 * Returns -1 for error in call
 */
export default async function sqlCountRows(sqlQuest, tableName, keyColumnName, searchKeyValue, keyIsNumeric) {

    try {
        /** @type {string} */
        let whereCondition = 'NULL';

        /** Validate / escape the search key */
        if (keyIsNumeric || typeof searchKeyValue !== 'string') { /** keyIsNumeric searchKeyValue must be a number */
            if (Number.isNaN(searchKeyValue)) {
                return -1;
            } else {
                if (typeof searchKeyValue === 'string') {
                    whereCondition = sqlQuest.sqlDouble(parseFloat(searchKeyValue))
                } else {
                    whereCondition = sqlQuest.sqlDouble(searchKeyValue)
                };
            };
        } else { /** Escape the SQL search parameter for direct injection */
            whereCondition = sqlQuest.sqlString(searchKeyValue);
        };

        /** @const {string} sql */
        const sql = "SELECT COUNT(*) FROM " + tableName + 
            " WHERE " + keyColumnName + "=" + whereCondition;
 
        /** @const {Array} countRowsArr */
        const countRowsArr = await sqlQuest.query(sql);
        
        if (Array.isArray(countRowsArr)) {

            return countRowsArr[0][0];

        } else {
            return -1;
        };

    } catch (err) {
        console.error(import.meta.url + '.sqlCountRows():', err);
        return -1;
    };
}