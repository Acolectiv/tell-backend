import express, { Request, Response } from "express";

import CommunityResult from "../typings/CommunityResult";
import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import Community from "../modules/Community/Community";

router.post('/create', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { name, description } = req.body;

        if(!name || !description)
            return res.status(401).send({ success: false, error: "noNameOrDescription" });

        const commentRes: CommunityResult = await Community.getInstance().createCommunity(req.userId, { name, description });
        if(commentRes.result == "error") return res.status(400).json({ success: false, msg: commentRes.msg });
        else res.json({ success: true, community: commentRes.community });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

const communityRoute = router;
export default communityRoute;