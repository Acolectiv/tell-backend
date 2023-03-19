import "dotenv/config";

import "./config/db";

import express from "express";
import { routes } from "./routes";
import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
// @ts-ignore
import xss from "xss-clean";
import compression from "compression";
import sanitize from "express-mongo-sanitize";

// @ts-ignore
import mongooseFilterQuery from "@sliit-foss/mongoose-filter-query";

import config from "./config/server";

let limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000
});

const app = express();

app.use(helmet());
app.use(xss());
app.use(sanitize());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(limiter);
app.use(cors());

app.use(mongooseFilterQuery);

app.use("/api", routes);

app.listen(config.port, () => console.log(`[Express] -> Web Server running on port ${config.port}`));