import express from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as community from "../controllers/community.controller";

export default class CommunityRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/community';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.post('/create', auth, community.createCommunity);
    }
}