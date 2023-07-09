import express from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as tells from "../controllers/tells.controller";

export default class TellRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/notification';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.post('/create', auth, tells.createTell);
        this.router.post('/delete', auth, tells.deleteTell);
        this.router.post('/like/:tellId', auth, tells.likeTell);
        this.router.post('/dislike/:tellid', auth, tells.dislikeTell);
        this.router.post('/removeLikeOrDislike', auth, tells.removeLikeOrDislikeTell);
        this.router.post('/fetch/:tellId', auth, tells.fetchTell);
        this.router.post('/fetchAll/:userId:limit', auth, tells.fetchAllTells);
        this.router.post('/filter', auth, tells.filterTells);
    }
}