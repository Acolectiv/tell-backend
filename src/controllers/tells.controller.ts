import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import TellResult from "../typings/TellResult";

import UserManager from "../managers/UserManager";
import TellManager from "../managers/TellManager";

export async function createTell(req: IUserRequest, res: Response) {
    try {
        const { text, title } = req.body;

        if(!text || !title) return res.status(404).send({ success: false, error: "noTextOrTitle" });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(req.userId, req.userId);
        if(result == "error") return res.status(401).send({ success: false, msg });

        const tellRes: TellResult = await TellManager.getInstance().postTell(user, text, title);
        if(tellRes.result == "success") return res.json({ success: true, tell: tellRes.tell });
        else return res.status(401).send({ success: false, error: tellRes.msg });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function deleteTell(req: IUserRequest, res: Response) {
    try {
        const { tellId } = req.body;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(req.userId, req.userId);
        if(result == "error") return res.status(401).send({ success: false, msg });

        const tellRes: TellResult = await TellManager.getInstance().deleteTell(user, tellId);
        if(tellRes.result == "success") return res.json({ success: true, tells: tellRes.tell });
        else return res.status(401).send({ success: false, error: tellRes.msg });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function likeTell(req: IUserRequest, res: Response) {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(req.userId, req.userId);
        if(result == "error") return res.status(401).send({ success: false, msg });

        const tellRes: TellResult = await TellManager.getInstance().likeTell(user, tellId);
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function dislikeTell(req: IUserRequest, res: Response) {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(req.userId, req.userId);
        if(result == "error") return res.status(401).send({ success: false, msg });

        const tellRes: TellResult = await TellManager.getInstance().dislikeTell(user, tellId);
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function removeLikeOrDislikeTell(req: IUserRequest, res: Response) {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(req.userId, req.userId);
        if(result == "error") return res.status(401).send({ success: false, msg });

        const tellRes: TellResult = await TellManager.getInstance().removeLikeOrDislikeTell(user, tellId);
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchTell(req: IUserRequest, res: Response) {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(req.userId, req.userId);
        if(result == "error") return res.status(401).send({ success: false, msg });

        const tellRes: TellResult = await TellManager.getInstance().fetchTell(tellId, { viewer: req.userId });
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchAllTells(req: IUserRequest, res: Response) {
    try {
        const { userId } = req.params;
        const { limit } = req.body;

        if(!userId) return res.status(404).send({ success: false, error: "noAuthor" });

        const tellRes: TellResult = await TellManager.getInstance().fetchUserTells(req.userId, parseInt(limit));
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function filterTells(req: IUserRequest, res: Response) {
    try {
        let user = await TellManager.getInstance().filterTell(req.query.filter, req.query.sort);
        if(!user) return res.status(401).send({ sucess: false, error: "noTell" });

        return res.send({ success: true, user: user });
    } catch (e) {
        res.status(500).send({ success: false, error: e });
    }
}