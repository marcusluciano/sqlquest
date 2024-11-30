/**
 * @file SQL safe string character injector RegEx and accompanying replacement string
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com> 
 * @author FormaWare LLC
 * 
 * @module sql-safe-string
 * 
 * @export @default sqlSafeString()
 */

import { DBTYPES } from './SqlQuest.mjs';

import { sqlRegEx } from './sql-regex.mjs';

/**
 * @function sqlSafeString()
 * @param {string|Buffer} strText 
 * @param {string} dbType 
 * @returns {string}
 */
export default function sqlSafeString(strText, dbType) {

    if (typeof strText === 'string') {
            
        switch (dbType) {
            
            case DBTYPES.PG:
                return (`'` + strText
                    .replace(sqlRegEx.quote.regEx, sqlRegEx.quote.sqlSafe)
                    .replace(sqlRegEx.backslash.regEx, sqlRegEx.backslash.sqlSafe)
                    .replace(sqlRegEx.controlChars.regEx, sqlRegEx.controlChars.sqlSafe) 
                    + `'`)
                    
            case DBTYPES.MSSQL:
                return (`'` + strText
                    .replace(sqlRegEx.quote.regEx, sqlRegEx.quote.sqlSafe)
                    .replace(sqlRegEx.controlChars.regEx, sqlRegEx.controlChars.sqlSafe) 
                    + `'`);
                
            case DBTYPES.SQLITE:
                return (`'` + strText
                    .replace(sqlRegEx.quote.regEx, sqlRegEx.quote.sqlSafe)
                    .replace(sqlRegEx.controlChars.regEx, sqlRegEx.controlChars.sqlSafe) 
                    + `'`);

            case DBTYPES.MARIA:
                return (`'` + strText
                    .replace(sqlRegEx.quote.regEx,      sqlRegEx.quote.sqlSafe)
                    .replace(sqlRegEx.backslash.regEx,  sqlRegEx.backslash.sqlSafe)
                    .replace(sqlRegEx.null.regEx,       sqlRegEx.null.sqlSafe)
                    .replace(sqlRegEx.backSpace.regEx,  sqlRegEx.backSpace.sqlSafe)
                    .replace(sqlRegEx.tab.regEx,        sqlRegEx.tab.sqlSafe)
                    .replace(sqlRegEx.x1a.regEx,        sqlRegEx.x1a.sqlSafe)
                    + `'`);

            default: // DBTYPES.PG
                /** Postgres */
                return (`'` + strText
                    .replace(sqlRegEx.quote.regEx, sqlRegEx.quote.sqlSafe)
                    .replace(sqlRegEx.backslash.regEx, sqlRegEx.backslash.sqlSafe)
                    .replace(sqlRegEx.controlChars.regEx, sqlRegEx.controlChars.sqlSafe) 
                    + `'`)
        }

    } else if (strText instanceof Buffer) {
        
        return sqlSafeString(strText.toString('utf-8'), dbType)
    };
    
    return 'NULL'
}
