SQL Connector pool for Microsoft SQL Server, PostgreSQL, MariaDB, and Sqlite

Documented in JSDoc, coded in ES2020, type checked with TypeScript

See ./src/SqlQuest.js for an explanation of the methods.

Connection is opened via JSON file, see ./src/@types/sql-quest-config-types.js 
for how to structure your JSON

Example:

const sqlQuest = new SqlQuest(pgConfigJsonFile)

let resultArrArr = await sqlQuest.query('SELECT CustomerCode, CustomerName FROM Customer WHERE CustomerName LIKE '%SMITH%'');

await sqlQuest.dbClose();


Pull requests are not being taken at thise time.



