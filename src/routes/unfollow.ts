import express from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as unfollow from "../controllers/unfollow.controller";

export default class UnfollowRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/unfollow';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.post('/', auth, unfollow.unfollowUser);
    }
}