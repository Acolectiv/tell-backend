import mongoose from "mongoose";

import "../models";
console.log(`[Models] -> Models loaded.`);

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.once("open", () => {
    console.log("[Database] -> Connection established.");
});

db.once("error", error => {
    console.error(`[Database] -> Error: ${error}`);
});

db.once("close", () => {
    console.warn("[Database] -> Database disconnected.");
});

export default db;