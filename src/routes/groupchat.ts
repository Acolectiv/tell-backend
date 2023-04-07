import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import MessageCenter from "../modules/Messages/MessageCenter";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { members, gcType } = req.body;

        if(!members || gcType != 0)
            return res.status(401).send({ success: false, error: "noMembersOrGcType" });

        const { result, msg, gc } = await MessageCenter.getInstance().createGC({
            gcType,
            members,
            author: req.userId
        });
        if(result === 'error') return res.status(401).send({ success: false, error: msg });

        return res.send({ success: true, gc });
    } catch(e) {
        console.log(e)
        res.status(500).send({ success: false, error: e });
    };
});

const groupChatRoute = router;
export default groupChatRoute;