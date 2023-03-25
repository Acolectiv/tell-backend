import express, { Request, Response } from "express";

import CommentResult from "../typings/CommentResult";
import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import CommentManager from "../managers/CommentManager";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId, text } = req.body;

        if(!tellId || !text)
            return res.status(401).send({ success: false, error: "noTellIdOrText" });

        const commentRes: CommentResult = await CommentManager.getInstance().postComment(tellId, { text, author: req.userId });
        if(commentRes.result == "error") return res.status(400).json({ success: false, msg: commentRes.msg });
        else res.json({ success: true, comment: commentRes.comment });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/delete', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { commentId } = req.body;

        if(!commentId)
            return res.status(401).send({ success: false, error: "noCommentId" });

        const commentRes: CommentResult = await CommentManager.getInstance().deleteComment(req.userId, commentId);
        if(commentRes.result == "error") return res.status(400).json({ success: false, msg: commentRes.msg });
        else res.json({ success: true, comments: commentRes.comments });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/like', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { commentId } = req.body;

        if(!commentId)
            return res.status(401).send({ success: false, error: "noCommentId" });

        const commentRes: CommentResult = await CommentManager.getInstance().likeComment(req.userId, commentId);
        if(commentRes.result == "error") return res.status(400).json({ success: false, msg: commentRes.msg });
        else res.json({ success: true, comment: commentRes.comment });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/dislike', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { commentId } = req.body;

        if(!commentId)
            return res.status(401).send({ success: false, error: "noCommentId" });

        const commentRes: CommentResult = await CommentManager.getInstance().dislikeComment(req.userId, commentId);
        if(commentRes.result == "error") return res.status(400).json({ success: false, msg: commentRes.msg });
        else res.json({ success: true, comment: commentRes.comment });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/removeLikeOrDislike', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { commentId } = req.body;

        if(!commentId)
            return res.status(401).send({ success: false, error: "noCommentId" });

        const commentRes: CommentResult = await CommentManager.getInstance().removeLikeOrDislikeComment(req.userId, commentId);
        if(commentRes.result == "error") return res.status(400).json({ success: false, msg: commentRes.msg });
        else res.json({ success: true, comment: commentRes.comment });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetch/:commentId', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { commentId } = req.params;

        if(!commentId)
            return res.status(401).send({ success: false, error: "noCommentId" });

        const commentRes: CommentResult = await CommentManager.getInstance().fetchComment(commentId);
        if(commentRes.result == "error") return res.status(400).json({ success: false, msg: commentRes.msg });
        else res.json({ success: true, comment: commentRes.comment });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetchAll', auth, async (req: IUserRequest, res: Response) => {
    try {
        if(!req.query.tellId)
            return res.status(401).send({ success: false, error: "noTellId" });

        const { result, comments } = await CommentManager.getInstance().fetchComments(`${req.query.tellId}`, parseInt(`${req.query.limit}`) || 0);

        if(result == "success") return res.json({ success: true, comments });
        else return res.status(400).json({ success: false, comments: [] });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

const commentRoute = router;
export default commentRoute;