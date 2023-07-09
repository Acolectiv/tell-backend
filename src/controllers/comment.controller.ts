import express, { Request, Response } from "express";

import CommentResult from "../typings/CommentResult";
import IUserRequest from "../interfaces/IUserRequest";

import CommentManager from "../managers/CommentManager";

export async function createComment(req: IUserRequest, res: Response) {
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
}

export async function deleteComment(req: IUserRequest, res: Response) {
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
}

export async function likeComment(req: IUserRequest, res: Response) {
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
}

export async function dislikeComment(req: IUserRequest, res: Response) {
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
}

export async function removeLikeOrDislikeComment(req: IUserRequest, res: Response) {
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
}

export async function fetchComment(req: IUserRequest, res: Response) {
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
}

export async function fetchAllComments(req: IUserRequest, res: Response) {
    try {
        if(!req.query.tellId)
            return res.status(401).send({ success: false, error: "noTellId" });

        const { result, comments } = await CommentManager.getInstance().fetchComments(`${req.query.tellId}`, parseInt(`${req.query.limit}`) || 0);

        if(result == "success") return res.json({ success: true, comments });
        else return res.status(400).json({ success: false, comments: [] });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
}