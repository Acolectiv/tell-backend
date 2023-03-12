import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import IUser from "../interfaces/IUser";
import UserResult from "../typings/UserResult";
import TellResult from "../typings/TellResult";

const router = express.Router();

import UserManager from "../managers/UserManager";
import TellManager from "../managers/TellManager";

import auth from "../middleware/auth";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { text } = req.body;

        if(!text) return res.status(404).send({ success: false, error: "noText" });

        let user = await UserManager.getInstance().fetchUser(req.userId);
        if(!user) return res.status(401).send({ success: false, error: "noUser" });

        const tellRes: TellResult = await TellManager.getInstance().postTell(user, text);
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

const tellsRoute = router;
export default tellsRoute;