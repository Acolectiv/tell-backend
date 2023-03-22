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

// import "./websocket/ws";

// @ts-ignore
import mongooseFilterQuery from "@sliit-foss/mongoose-filter-query";

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

app.get("/", (req: any, res: any) => {
    res.json({ success: true, msg: "online" });
});

app.use("/api", routes);

export default app;