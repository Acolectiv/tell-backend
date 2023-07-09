import express from "express";

import auth from "../middleware/auth";

import IRoute from "../interfaces/IRoute";

import * as note from "../controllers/note.controller";

export default class NoteRoute implements IRoute {
    public path: string;
    public router: express.Router;

    constructor() {
        this.path = '/api/note';

        this.router = express.Router();

        this.initializeRoute();
    }

    initializeRoute(): void {
        this.router.post('/create', auth, note.createNote);
        this.router.post('/delete', auth, note.deleteNote);
        this.router.get('/fetch/:noteId', auth, note.fetchNote);
        this.router.post('/edit', auth, note.editNote);
    }
}