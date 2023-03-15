import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import CommentManager from "../managers/CommentManager";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId, text } = req.body;

        if(!tellId || !text)
            return res.status(401).send({ success: false, error: "noTellIdOrText" });

        const { result, msg, comment } = await CommentManager.getInstance().postComment(tellId, { text, author: req.userId });
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, comment });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/delete', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { commentId } = req.body;

        if(!commentId)
            return res.status(401).send({ success: false, error: "noCommentId" });

        const { result, msg, comments } = await CommentManager.getInstance().deleteComment(req.userId, commentId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else res.json({ success: true, comments });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetch', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { commentId } = req.body;

        if(!commentId)
            return res.status(401).send({ success: false, error: "noCommentId" });

        const comment = await CommentManager.getInstance().fetchComment(commentId);
        return res.json({ success: true, comment });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetchAll', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId, limit } = req.body;

        if(!tellId)
            return res.status(401).send({ success: false, error: "noTellId" });

        const comments = await CommentManager.getInstance().fetchComments(tellId, limit);
        return res.json({ success: true, comments });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

const commentRoute = router;
export default commentRoute;