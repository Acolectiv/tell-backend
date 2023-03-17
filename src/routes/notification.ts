import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

import NotificationTypes from "../typings/NotificationTypes";

const router = express.Router();

import NotificationManager from "../managers/NotificationManager";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { type, text } = req.body;

        if(!type || !text)
            return res.status(401).send({ success: false, error: "noTypeOrText" });

        let { result, msg, notification } = await NotificationManager.getInstance().postNotification(req.userId, type, "hello there");
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, notification });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

const notificationRoute = router;
export default notificationRoute;