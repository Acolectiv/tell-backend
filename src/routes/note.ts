import express, { Request, Response } from "express";

import CommentResult from "../typings/CommentResult";
import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import NotesManager from "../managers/NotesManager";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { text } = req.body;

        if(!text)
            return res.status(401).send({ success: false, error: "noText" });

        const { result, msg, note } = await NotesManager.getInstance().postNote(req.userId, text);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/delete', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { noteId } = req.body;

        if(!noteId)
            return res.status(401).send({ success: false, error: "noNoteId" });

        const { result, msg, note } = await NotesManager.getInstance().deleteNote(req.userId, noteId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetch/:noteId', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { noteId } = req.params;

        if(!noteId)
            return res.status(401).send({ success: false, error: "noNoteId" });

        const { result, msg, note } = await NotesManager.getInstance().fetchNote(noteId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/edit', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { noteId, text } = req.body;

        if(!noteId || !text)
            return res.status(401).send({ success: false, error: "noNoteIdOrText" });

        const { result, msg, note } = await NotesManager.getInstance().editNote(req.userId, noteId, text);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, note });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

const noteRoute = router;
export default noteRoute;