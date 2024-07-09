/**
 * Test asssumes you have full rights to the database
 * and a table in it named "users" exists
 */

import SqlQuest, { DBTYPES } from '../SqlQuest.js';
import { Readable } from 'stream';

const fs = await import('node:fs');

/**
 * SQL Stream to file
 * @param {string} fid - String path to file
 * @param {SqlQuest} quest - SqlQuest object 
 * @param {string} query - Prepared SQL SELECT query
 */
async function streamToFile(fid, quest, query) {
    try {

        let fidStream = fs.createWriteStream(fid, {encoding: 'utf8'});

        /** @type {Readable|unknown} */
        let sqlStream = await quest.streamQuery(query);

        if (sqlStream) { // @ts-ignore
            sqlStream.pipe(fidStream);
        }

        fidStream.on('finish', () => { 
            fidStream.end();
        })

    } catch (err) {
        console.log("streamToFile", JSON.stringify(err))
    }
}

console.log("process.env.SQLQUEST_TEST_CONFIG=", process.env.SQLQUEST_TEST_CONFIG);

/** Test database should be disposable and not sensitive */
import msConfig from './mssql.test.config.json' assert {type: 'json'};
import pgConfig from './pg.test.config.json' assert {type: 'json'};
import myConfig from './mysql.test.config.json' assert {type: 'json'};

let dbType = process.env.SQLQUEST_TEST_CONFIG

console.log("Opening", dbType, "pool");

switch (process.env.SQLQUEST_TEST_CONFIG) { 

    case DBTYPES.MSSQL: 
        if (process.env.DBPASSWORD) {
            msConfig.config.password=process.env.DBPASSWORD
        };
        var sqlQuest = new SqlQuest(msConfig); 
        dbType = DBTYPES.MSSQL
        break;

    case DBTYPES.PG: 
        if (process.env.DBPASSWORD) {
            pgConfig.config.password=process.env.DBPASSWORD
        };
        var sqlQuest = new SqlQuest(pgConfig);
        dbType = DBTYPES.PG
        break;

    case DBTYPES.MARIA: 
        if (process.env.DBPASSWORD) {
            myConfig.config.password=process.env.DBPASSWORD
        };
        var sqlQuest = new SqlQuest(myConfig);
        dbType = DBTYPES.MARIA
        break;

    case DBTYPES.SQLITE: 
        var sqlQuest = new SqlQuest(myConfig);
        dbType = DBTYPES.SQLITE
        break;

    default: 
        var sqlQuest = new SqlQuest(msConfig); break;

}
if ( ! sqlQuest ) process.exit(1);

if ( ! await sqlQuest.dbOpen()) {
    console.log("Could not open database")
    process.exit(2)
}; 

console.log(process.env.SQLQUEST_TEST_CONFIG, "pool open");

/** @constant {Array} */
const users = await sqlQuest.query("SELECT * FROM users");

console.log(users.length, "users on file");

var sql = "DROP TABLE drinks;";
console.log("Dropping table drinks");
try {
    await sqlQuest.execute(sql);
} catch (err) {
    console.log("Could not drop drinks")
};

if (dbType === DBTYPES.PG) {
    sql = "CREATE TABLE drinks("
        + "drinkid varchar(255),"
        + "description text,"
        + "added varchar(30),"
        + "addedby varchar(20),"
        + "price float,"
        + "timesmade bigint,"
        + "PRIMARY KEY (drinkid));"
} else if (dbType === DBTYPES.MSSQL) {
    sql = "CREATE TABLE drinks("
        + "drinkid varchar(255),"
        + "description varchar(max),"
        + "added varchar(30),"
        + "addedby varchar(20),"
        + "price float,"
        + "timesmade bigint,"
        + "PRIMARY KEY (drinkid));"
} else if (dbType === DBTYPES.MARIA) {
    sql = "CREATE TABLE drinks("
        + "drinkid varchar(255),"
        + "description longtext,"
        + "added varchar(30),"
        + "addedby varchar(20),"
        + "price float,"
        + "timesmade bigint,"
        + "PRIMARY KEY (drinkid));"
} else if (dbType === DBTYPES.SQLITE) {
    sql = "CREATE TABLE drinks("
        + "drinkid varchar(255),"
        + "description text,"
        + "added varchar(30),"
        + "addedby varchar(20),"
        + "price float,"
        + "timesmade bigint,"
        + "PRIMARY KEY (drinkid));"
};

console.log("dbType=", dbType, " Creating table");

/** @const {string} dt */
const dt = new Date(Date.now()).toISOString().slice(0,30);

try {
    await sqlQuest.execute(sql).catch(err => {console.log("Error creating table")});
    console.log("Table created");
} catch (err) {
    console.log(sql, err);
    process.exit(101);
}
console.log("Proceeding");

sql = "INSERT INTO drinks(drinkid,description,added,addedby,price) VALUES "

var data = "('D01','Lemonade'," + sqlQuest.sqlString(dt) + ",'tester', 1.99)"
console.log("SQL=", sql + data)
console.log("Inserting lemonade:", await sqlQuest.execute(sql + data).catch(err => {console.log(err)}));

data = "('D02','Limeaid'," + sqlQuest.sqlString(dt) + ",'tester', 1.99)"
console.log("Inserting limeade:", await sqlQuest.execute(sql + data).catch(err => {console.log(err)}));

data = "('D03','Hot Chocolate'," + sqlQuest.sqlString(dt) + ",'tester', 2.49)"
console.log("Inserting hot chocolate:", await sqlQuest.execute(sql + data).catch(err => {console.log(err)}));

data = "('D04'," + sqlQuest.sqlString(`col'a`) + "," + sqlQuest.sqlString(dt) + ",'tester', 4.49)"
console.log("SQL=", sql + data)
console.log("Inserting cola", await sqlQuest.execute(sql + data).catch(err => {console.log(err)}));

data = "('D05','Seltzer'," + sqlQuest.sqlString(dt) + ",'tester', 1.49)"
console.log("Inserting seltzer", await sqlQuest.execute(sql + data).catch(err => {console.log(err)}));

data = "('DXXX','Some bad data - this shouldn''t be here'," + sqlQuest.sqlString(dt) + ",'tester that is way too long of a string to be acceptable', 1.49)"
console.log("Inserting some bad data", await sqlQuest.execute(sql + data).catch(err => {console.log(err)}));

console.log("Ordering drinks");

let outStream = fs.createWriteStream('./src/tests/drinks.txt', {encoding: 'utf8'});

console.log("outStream writableObjectMode:", outStream.writableObjectMode)

/** Stream query test
 * @type {Readable|void} drinks
 */
let drinks = await sqlQuest.streamQuery("SELECT * FROM drinks", "12345");

console.log("Piping drinks");

if (drinks) {
    console.log("drinks readableObjectMode:", drinks.readableObjectMode)
    drinks.pipe(outStream);
} else {
    console.log("     *** There are no drinks, this is an outrage ***")
};

outStream.on('finish', () => {
    outStream.end
})

outStream = fs.createWriteStream('./src/tests/users.txt', {encoding: 'utf8'});

let drunks = await sqlQuest.streamQuery("SELECT * FROM users","request ID#12345");

if (drunks) {
    drunks
    .pipe(outStream)
    .on('close', () => {
        console.log("All drunks piped out *hic*")
        if (drunks) { drunks.destroy() }; // <<<----- FORGETTING THIS WILL HOLD THE SQL STREAM OPEN and probably the SQL connection too
    })

} else {
    console.log("     *** There are no drunks ***")
}

if (drunks) {
    if ( ! drunks.destroyed) {
        console.log("drunks stream was not destroyed yet")
    } else {
        console.log("Stream A-OK")
    }
}

/** Transaction with commit */

let sqlArr = [];
data = "('D06','Monster Energy drink'," + sqlQuest.sqlString(dt) + `,'trans', 5.49)`
sqlArr.push(sql + data);
data = "('D07','PUR bad tasting water'," + sqlQuest.sqlString(dt) + `,'trans', 2.49)`
sqlArr.push(sql + data);

/** @type {undefined|import("mssql").Transaction|import('pg').PoolClient|import('mysql2').PoolConnection|import('sqlite3').Database} */
let transHandle = await sqlQuest.transBegin("12345");

console.log("Performing 2 transactions")
console.log("Trans 1=", sqlArr[0]);
console.log("Trans 2=", sqlArr[1]);

if (transHandle){
    try { // @ts-ignore
        await sqlQuest.transAct(transHandle, sqlArr[0]); // @ts-ignore
        await sqlQuest.transAct(transHandle, sqlArr[1]); // @ts-ignore
        await sqlQuest.transCommit(transHandle);
        console.log("2 transactions committed")
    } catch (err) {
        await sqlQuest.transRollback(transHandle);
        console.log("Transactions were rolled back due to", JSON.stringify(err))
    }
};

/** Transaction with rollback */
sqlArr = [];
data = "('D08','Monster Energy drink sour apple'," + sqlQuest.sqlString(dt) + `,'trans', 15.49)`
sqlArr.push(sql + data);
data = "('D09','Bud Light'," + sqlQuest.sqlString(dt) + `,'trans', 9.49)`
sqlArr.push(sql + data);
/** [2] */
sqlArr.push("UPDATE drinks SET price=0.001"); // <-- LOOK MA FREE DRINKS

let rbStream = fs.createWriteStream('./src/tests/free drinks.txt', {encoding: 'utf8'});

/** @type {undefined|import("mssql").Transaction|import('pg').PoolClient|import('mysql2').PoolConnection|import('sqlite3').Database} */
transHandle = await sqlQuest.transBegin("12345");

if (transHandle){
    try { // @ts-ignore
        await sqlQuest.transAct(transHandle, sqlArr[0]); // @ts-ignore
        await sqlQuest.transAct(transHandle, sqlArr[1]); // @ts-ignore
        await sqlQuest.transAct(transHandle, sqlArr[2]);

        /** Note that transHandle can't be used to return recordsets, only record counts */

        let freeDrinks = await sqlQuest.streamQuery("SELECT * FROM drinks", false, "12345");
        if (freeDrinks) {
            console.log("drinks readableObjectMode:", freeDrinks.readableObjectMode)
            freeDrinks.pipe(rbStream);
        } else {
            console.log("     *** There are no free drinks, this is an outrage ***")
        };
        rbStream.on('finish', () => {
            rbStream.end
        })

        await sqlQuest.transRollback(transHandle);
        console.log("Transaction rollback success")
    } catch (err) {
        await sqlQuest.transRollback(transHandle);
        console.log("Transactions were rolled back due to", JSON.stringify(err))
    }
};

/** Regular old query test */
let testQuery = await sqlQuest.query("SELECT * FROM drinks").catch(err => {console.log("Error selecting drinks")})

if (testQuery) {
    console.log("Test query of drinks:", JSON.stringify(testQuery))
} else {
    "Drinks query FAILS - we can't even ask for drinks"
}

if (drunks) {
    if ( ! drunks.destroyed) {
        console.log("drunks stream was not destroyed yet - how do we tell it's hanging?")
        drunks.destroy();
    } else {
        console.log("Stream A-OK, but how do we know if it's not?")
    }
}

/** Second round of drinks */
let outStream2 = fs.createWriteStream('./src/tests/drinks round 2.txt', {encoding: 'utf8'});

drinks = await sqlQuest.streamQuery("SELECT * FROM drinks", "12345");

let secondRoundDelivered = false;

if (drinks) {
    console.log("Second round readableObjectMode:", drinks.readableObjectMode)
    drinks.pipe(outStream2);
} else {
    console.log("     *** There are no drinks, this is an outrage ***")
};

outStream2.on('finish', async () => {

    outStream2.end

    console.log("outStream2 ended")

    secondRoundDelivered = true
})

while ( ! secondRoundDelivered) {
    /** Sleep 10ms */
    console.log("Waiting for outStream2")
    await new Promise(r => setTimeout(r, 100));
}

process.exit(0);