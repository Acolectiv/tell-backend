import express from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as follow from "../controllers/follow.controller";

export default class FollowRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/follow';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.post('/', auth, follow.followUser);
        this.router.get('/fetchFollowers', auth, follow.fetchFollowers);
        this.router.get('/fetchFollowing', auth, follow.fetchFollowing);
    }
}