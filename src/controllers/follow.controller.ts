import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";

import FollowManager from "../managers/FollowManager";

export async function followUser(req: IUserRequest, res: Response) {
    try {
        const { followedId } = req.body;

        if(!followedId)
            return res.status(401).send({ success: false, error: "noFollowerOrFollowed" });

        const followRes = await FollowManager.getInstance().followUser(req.userId, followedId);
        if(followRes.result === 'error') return res.status(401).send({ success: false, error: followRes.msg });

        return res.send({ success: true, follower: followRes.follower, followed: followRes.followed });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchFollowers(req: IUserRequest, res: Response) {
    try {
        return res.send({ success: true, followers: await FollowManager.getInstance().fetchFollowers(req.userId, req.userId) });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchFollowing(req: IUserRequest, res: Response) {
    try {
        return res.send({ success: true, followers: await FollowManager.getInstance().fetchFollowing(req.userId, req.userId) });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}