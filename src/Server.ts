import "dotenv/config";
import "./config/db";
import config from "./config/server";

import express, { Express } from "express";
import http from "http";

import bodyParser from "body-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
// @ts-ignore
import helmet from "helmet";
// @ts-ignore
import xss from "xss-clean";
import compression from "compression";
import sanitize from "express-mongo-sanitize";
// @ts-ignore
import mongooseFilterQuery from "@sliit-foss/mongoose-filter-query";
import logger from "./utils/logger";

import SocketIOHandler from "./SocketIOHandler";
import IRoute from "./interfaces/IRoute";

import AccountsRoute from "./routes/accounts";
import CommentsRoute from "./routes/comments";
import CommunityRoute from "./routes/community";
import FollowRoute from "./routes/follow";
import NoteRoute from "./routes/note";
import NotificationRoute from "./routes/notification";
import TellRoute from "./routes/tells";
import UnfollowRoute from "./routes/unfollow";

class Server {
    private app: Express;
    private sv: http.Server;
    private socket: SocketIOHandler;

    constructor() {
        this.app = express();
        this.sv = http.createServer(this.app);
        this.socket = new SocketIOHandler(this.sv);

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeSockets();
    }

    private initializeMiddleware(): void {
        this.app.use(helmet());
        this.app.use(xss());
        this.app.use(sanitize());
        this.app.use(compression());
        this.app.use(bodyParser.json());

        this.app.use(bodyParser.urlencoded({
            extended: false
        }));

        this.app.use(cors());

        this.app.use(rateLimit({
            windowMs: 1 * 60 * 1000,
            max: 1000
        }));

        this.app.use(mongooseFilterQuery);
    }

    private initializeRoutes(): void {
        const routes: IRoute[] = [
            new AccountsRoute(),
            new CommentsRoute(),
            new CommunityRoute(),
            new FollowRoute(),
            new UnfollowRoute(),
            new NoteRoute(),
            new NotificationRoute(),
            new TellRoute()
        ];

        routes.forEach((route) => {
            this.app.use(route.path, route.router);
        });
    }

    private initializeSockets(): void {
        this.socket.configureSockets();
    }

    public start(): void {
        this.app.listen(config.port, () => {
            logger.debug({ event: "express.js" }, `running on port ${config.port}`);
        });
    }
}

export default Server;