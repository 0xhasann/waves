import { Database } from "bun:sqlite";
import { resolve } from "path";
import { randomUUID } from "crypto";

// creates or opens database file
// const db = new Database("app.db");

const dbPath = resolve("./app.db"); // or a fixed path
const db = new Database(dbPath);

console.log("dbPath:", dbPath);
console.log("db:", db);

// create table
// db.run(`
//   CREATE TABLE IF NOT EXISTS users_test (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT
//   )
// `);

// // insert data
db.run("INSERT INTO users_test (id,name) VALUES (?,?)", [randomUUID(),"Hasan"]);

// // query data
const users = db.query("SELECT * FROM users_test").all();

console.log(users);