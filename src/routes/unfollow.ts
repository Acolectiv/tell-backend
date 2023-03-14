import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import FollowManager from "../managers/FollowManager";

router.post('/', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { unfollowedId } = req.body;

        if(!unfollowedId)
            return res.status(401).send({ success: false, error: "noFollowerOrFollowed" });

        const followRes = await FollowManager.getInstance().unfollowUser(req.userId, unfollowedId);
        if(followRes.result === 'error') return res.status(401).send({ success: false, error: followRes.msg });

        return res.send({ success: true, unfollower: followRes.unfollower, unfollowed: followRes.unfollowed });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

const unfollowRoute = router;
export default unfollowRoute;