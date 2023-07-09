import express, { Request, Response } from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as comment from "../controllers/comment.controller";

export default class CommentsRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/comments';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.get('/fetch/:commentId', auth, comment.fetchComment);
        this.router.get('/fetchAll', auth, comment.fetchAllComments);
        this.router.post('/create', comment.createComment);
        this.router.post('/delete', auth, comment.deleteComment);
        this.router.post('/like', auth, comment.likeComment);
        this.router.post('/dislike', auth, comment.dislikeComment);
        this.router.post('/removeLikeOrDislike', auth, comment.removeLikeOrDislikeComment);
    }
}