import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";

import FollowManager from "../managers/FollowManager";

export async function unfollowUser(req: IUserRequest, res: Response) {
    try {
        const { unfollowedId } = req.body;

        if(!unfollowedId)
            return res.status(401).send({ success: false, error: "noFollowerOrFollowed" });

        const followRes = await FollowManager.getInstance().unfollowUser(req.userId, unfollowedId);
        if(followRes.result === 'error') return res.status(401).send({ success: false, error: followRes.msg });

        return res.send({ success: true, unfollower: followRes.unfollower, unfollowed: followRes.unfollowed });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}