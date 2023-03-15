import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import TellResult from "../typings/TellResult";

const router = express.Router();

import UserManager from "../managers/UserManager";
import TellManager from "../managers/TellManager";

import auth from "../middleware/auth";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { text, title } = req.body;

        if(!text || !title) return res.status(404).send({ success: false, error: "noTextOrTitle" });

        let user = await UserManager.getInstance().fetchUser(req.userId);
        if(!user) return res.status(401).send({ success: false, error: "noUser" });

        const tellRes: TellResult = await TellManager.getInstance().postTell(user, text, title);
        if(tellRes.result == "success") return res.json({ success: true, tell: tellRes.tell });
        else return res.status(401).send({ success: false, error: tellRes.msg });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/delete', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId } = req.body;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let user = await UserManager.getInstance().fetchUser(req.userId);
        if(!user) return res.status(401).send({ success: false, error: "noUser" });

        const tellRes: TellResult = await TellManager.getInstance().deleteTell(user, tellId);
        if(tellRes.result == "success") return res.json({ success: true, tells: tellRes.tell });
        else return res.status(401).send({ success: false, error: tellRes.msg });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/like/:tellId', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let user = await UserManager.getInstance().fetchUser(req.userId);
        if(!user) return res.status(401).send({ success: false, error: "noUser" });

        const tellRes: TellResult = await TellManager.getInstance().likeTell(user, tellId);
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/dislike/:tellId', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let user = await UserManager.getInstance().fetchUser(req.userId);
        if(!user) return res.status(401).send({ success: false, error: "noUser" });

        const tellRes: TellResult = await TellManager.getInstance().dislikeTell(user, tellId);
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/removeLikeOrDislike/:tellId', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let user = await UserManager.getInstance().fetchUser(req.userId);
        if(!user) return res.status(401).send({ success: false, error: "noUser" });

        const tellRes: TellResult = await TellManager.getInstance().removeLikeOrDislikeTell(user, tellId);
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetch/:tellId', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { tellId } = req.params;

        if(!tellId) return res.status(404).send({ success: false, error: "noTellId" });

        let user = await UserManager.getInstance().fetchUser(req.userId);
        if(!user) return res.status(401).send({ success: false, error: "noUser" });

        const tellRes: TellResult = await TellManager.getInstance().fetchTell(tellId);
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetchAll/:userId:limit', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { limit } = req.body;

        if(!userId) return res.status(404).send({ success: false, error: "noAuthor" });

        const tellRes: TellResult = await TellManager.getInstance().fetchUserTells(req.userId, parseInt(limit));
        if(tellRes.result === "error") return res.status(400).json({ success: false, msg: tellRes.msg });
        else return res.status(200).json({ success: true, tell: tellRes.tell });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

const tellsRoute = router;
export default tellsRoute;