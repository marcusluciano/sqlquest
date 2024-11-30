/**
 * @function logError
 * @param {*} err
 * @param {string} moduleId - Import.meta.url
 * @param {string} message - Additional information about the error
 * @param {boolean} [useStdOut] - Send to stdOut buffer instead of stdErr
 * @param {boolean} [returnError] - Returns void if false, err if true
 * @returns {Error|void} Reflect err
 */
export function logError(err: any, moduleId: string, message: string, useStdOut?: boolean, returnError?: boolean): Error | void;
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
export function logSqlError(err: any, moduleId: string, databaseId: string, message: string, returnError?: boolean): any;
//# sourceMappingURL=log-errors.d.ts.map