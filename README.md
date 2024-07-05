# SQL &#9923;  &#8644; JSON &#128376; <br> connection pool

Simple SQL connection pool for Microsoft SQL Server, PostgreSQL, MariaDB, and Sqlite.

Documented in JSDoc, coded in ES2020, type checked with TypeScript.

Connection is opened via JSON file, see ./src/@types/sql-quest-config-types.js 
for how to structure your JSON.

See ./src/SqlQuest.js for an explanation of the methods.

Example:

  import SqlQuest from 'sqlconnector';

  const sqlQuest = new SqlQuest(pgConfigJsonFile);

  let resultArrArr = await sqlQuest.query('SELECT CustomerCode, CustomerName FROM Customer WHERE CustomerName LIKE '%SMITH%'');

  let transactionConnection = await sqlQuest.transBegin();
  sqlQuest.transAct(transactionConnection, aBunchOfSQL);
  sqlQuest.transAct(transactionConnection, moreSQL);
  sqlQuest.transCommit(transactionConnection);

  await sqlQuest.dbClose();


See ./src/tests/sqlquest.test.js for streaming example.  
Streams can return object or character streams.  Default is character.


Pull requests are not being taken at this time.



