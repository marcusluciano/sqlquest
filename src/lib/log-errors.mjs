/**
 * @file Functions to throw in case of various errors
 * 
 * @copyright Copyright (C) 2020 - 2024 FormaWare LLC All rights reserved.
 * @license MIT
 * @author Mark Lucas <MLucas@FormulatorUS.com>
 * @author FormaWare LLC
 */

import path from 'node:path';

/**
 * 
 * @param {string} moduleId 
 * @returns {string}
 */
function moduleName(moduleId) {
    try {
        return path.basename(moduleId)
    } catch (err) {
        return moduleId
    }
}

/**
 * @function logError
 * @param {*} err 
 * @param {string} moduleId - Import.meta.url
 * @param {string} message - Additional information about the error
 * @param {boolean} [useStdOut] - Send to stdOut buffer instead of stdErr
 * @param {boolean} [returnError] - Returns void if false, err if true
 * @returns {Error|void} Reflect err
 */
export function logError(err, moduleId, message, useStdOut, returnError) {
    
    if (useStdOut) {
        console.log(moduleName(moduleId), err, message, JSON.stringify(err));
        
    } else {
        console.error(moduleName(moduleId), err, message, JSON.stringify(err));
    };
    
    if (returnError) {return err};
};

/**
 * @function logSqlError
 * Thrown in case of SQL database errors
 * @param {*} err 
 * @param {string} moduleId - Import.meta.url
 * @param {string} databaseId 
 * @param {string} message 
 * @param {boolean} [returnError] - Returns void if false, err if true
 * @returns {*} Reflect err
 */
export function logSqlError(err, moduleId, databaseId, message, returnError) {
    
    console.log(moduleName(moduleId), err, message, 'in database', databaseId, JSON.stringify(err));
    
    if (returnError) {return err};
};
