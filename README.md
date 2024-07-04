# SQL &#9923;  &#8644; JSON &#128376; <br> connection pool

Simple SQL connection pool for Microsoft SQL Server, PostgreSQL, MariaDB, and Sqlite.

Documented in JSDoc, coded in ES2020, type checked with TypeScript.

Connection is opened via JSON file, see ./src/@types/sql-quest-config-types.js 
for how to structure your JSON.

See ./src/SqlQuest.js for an explanation of the methods.

Example:

  const sqlQuest = new SqlQuest(pgConfigJsonFile)

  let resultArrArr = await sqlQuest.query('SELECT CustomerCode, CustomerName FROM Customer WHERE CustomerName LIKE '%SMITH%'');

  await sqlQuest.dbClose();


Pull requests are not being taken at this time.



