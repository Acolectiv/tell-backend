import mongoose from "mongoose";

import logger from "../utils/logger";

import "../models";
logger.debug({ event: "database/models" }, 'models loaded');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI);

const db = mongoose.connection;

db.once("open", () => {
    logger.debug({ event: "database" }, 'connection established');
});

db.once("error", error => {
    console.error(`[Database] -> Error: ${error}`);
});

db.once("close", () => {
    console.warn("[Database] -> Database disconnected.");
});

export default db;