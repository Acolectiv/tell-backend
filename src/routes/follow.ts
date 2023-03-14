import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import FollowManager from "../managers/FollowManager";

router.post('/', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { followedId } = req.body;

        if(!followedId)
            return res.status(401).send({ success: false, error: "noFollowerOrFollowed" });

        const followRes = await FollowManager.getInstance().followUser(req.userId, followedId);
        if(followRes.result === 'error') return res.status(401).send({ success: false, error: followRes.msg });

        return res.send({ success: true, follower: followRes.follower, followed: followRes.followed });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetchFollowers', auth, async (req: IUserRequest, res: Response) => {
    try {
        return res.send({ success: true, followers: await FollowManager.getInstance().fetchFollowers(req.userId) });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetchFollowing', auth, async (req: IUserRequest, res: Response) => {
    try {
        return res.send({ success: true, followers: await FollowManager.getInstance().fetchFollowing(req.userId) });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

const followRoute = router;
export default followRoute;