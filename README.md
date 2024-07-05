# SQL &#9923;  &#8644; JSON &#128376; <br> connection pool

Simple SQL connection pool for Microsoft SQL Server, PostgreSQL, MariaDB, and Sqlite.

Documented in JSDoc, coded in ES2020, type checked with TypeScript.

Connection is opened via JSON file, see ./src/@types/sql-quest-config-types.js 
for how to structure your JSON.

See ./src/SqlQuest.js for an explanation of the methods.

Example:

  ```javascript
  import SqlQuest from 'sqlconnector';

  const sqlQuest = new SqlQuest(pgConfigJsonFile);

  /** Simple query example */
  let resultArrArr = await sqlQuest
    .query("SELECT CustomerCode, CustomerName FROM Customer " +
      "WHERE CustomerName LIKE " +
        sqlQuest.sqlString("%Smith%")
  );

  /** transaction example */
  let transactionConnection = await sqlQuest.transBegin();

  sqlQuest.transAct(transactionConnection, aBunchOfSQL);

  sqlQuest.transAct(transactionConnection, moreSQL);

  sqlQuest.transCommit(transactionConnection);

  await sqlQuest.dbClose();

  /** Streaming query example */ 
  let outStream = fs
  .createWriteStream('./src/tests/users.txt', {encoding: 'utf8'});

  let users = await sqlQuest
  .streamQuery("SELECT * FROM users","request ID#12345");

  if (users) {
    users
    .pipe(outStream)
    .on('close', () => {
        console.log("All users piped out")
        if (users) { users.destroy() }; // <<<----- FORGETTING THIS 
        // WILL HOLD THE SQL STREAM OPEN and along with the SQL connection
    });
  } else {
      console.log("*** There are no users ***")
  }

  ```
Streams can return object or character streams.  Default is character.


Pull requests are not being taken at this time.



