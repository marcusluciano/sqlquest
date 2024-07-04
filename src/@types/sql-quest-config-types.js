
/** SqlQuest configuration file
 * @typedef {object} sqlQuestConfig
 * @property {string} dbType - 'mssql', 'pg', 'mysql'
 * @property {import("mssql").config |
 *            import("pg").PoolConfig |
 *            import("mysql2").PoolOptions |
 *            undefined} config - Database config object
 * 
 * @property {boolean} [lowerCaseNames] - SQL table and column names
 * @property {boolean} [noBrackets] - Around SQL table and column names
 * @property {string} sslKeyLocation - File path
 * @property {string} sslCertLocation - File path
 * @property {string} [sqltableprefix] - 'dbo.' for mssql
 * @property {number} [userCountTimer] - Distinct requesters in past N minutes
 *//** 
 * @typedef {object} pgConfig
 * @property {string} dbType - 'pg'
 * @property {import("pg").PoolConfig} config - Database config object
 * @property {boolean} [lowerCaseNames] - SQL table and column names
 * @property {boolean} [noBrackets] - Around SQL table and column names
 * @property {string} sslKeyLocation - File path
 * @property {string} sslCertLocation - File path
 * @property {string} [sqltableprefix] - 'dbo.' for mssql
 * @property {number} [userCountTimer] - Distinct requesters in past N minutes
 *//** 
 * @typedef {object} mssqlConfig
 * @property {string} dbType - 'mssql'
 * @property {import("mssql").config} config - Database config object
 * @property {string} [sqltableprefix] - 'dbo.' for mssql
 * @property {boolean} [lowerCaseNames] - SQL table and column names
 * @property {boolean} [noBrackets] - Around SQL table and column names
 * @property {string} sslKeyLocation - File path
 * @property {string} sslCertLocation - File path
 * @property {string} [sqltableprefix] - 'dbo.' for mssql
 * @property {number} [userCountTimer] - Distinct requesters in past N minutes
 *//** 
 * @typedef {object} mariaConfig
 * @property {string} dbType - 'mysql2'
 * @property {import("mysql2").PoolOptions} config - Database config object
 * @property {boolean} [lowerCaseNames] - SQL table and column names
 * @property {boolean} [noBrackets] - Around SQL table and column names
 * @property {string} sslKeyLocation - File path
 * @property {string} sslCertLocation - File path
 * @property {string} [sqltableprefix] - 'dbo.' for mssql
 * @property {number} [userCountTimer] - Distinct requesters in past N minutes
 */

