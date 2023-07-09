import express from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as user from "../controllers/user.controller";

export default class AccountsRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/accounts';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.get('/fetch/:userId', auth, user.fetchUser);
        this.router.post('/login', user.loginUser);
        this.router.post('/create', user.createUser);
        this.router.post('/block/:userId', auth, user.blockUser);
        this.router.post('/unblock/:userId', auth, user.unblockUser);
        this.router.get('/filter', auth, user.filter);
    }
}