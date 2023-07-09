import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import UserResult from "../typings/UserResult";


import UserManager from "../managers/UserManager";

export async function createUser(req: IUserRequest, res: Response) {
    try {
        const { email, password, username } = req.body;

        if(!email || !password || !username)
            return res.status(401).send({ success: false, error: "noEmailOrPasswordOrUsername" });

        const userRes: UserResult = await UserManager.getInstance().createUser({ email, password, username }) as any;
        if(userRes.result === 'error') return res.status(401).send({ success: false, error: userRes.msg });

        return res.send({ user: userRes.user, token: userRes.token });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
}

export async function loginUser(req: IUserRequest, res: Response) {
    try {
        const { username, password } = req.body;

        if(!username || !password)
            return res.status(401).send({ success: false, error: "noUsernameOrPassword" });

        const userRes: UserResult = await UserManager.getInstance().loginUser({ username, password }) as any;
        if(userRes.result === 'error') return res.status(401).send({ success: false, error: userRes.msg });

        return res.send({ user: userRes.user, token: userRes.token });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function fetchUser(req: IUserRequest, res: Response) {
    try {
        let userId = req.params.userId;
        if(!userId) return res.status(401).send({ success: false, error: "noUserId" });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(req.userId, userId);
        if(result == "error") return res.status(401).send({ sucess: false, error: msg });

        return res.send({ success: true, user });
    } catch (e) {     
        res.status(500).send({ success: false, error: e });
    }
}

export async function blockUser(req: IUserRequest, res: Response) {
    try {
        let { userId } = req.params;
        if(!userId) return res.status(401).send({ success: false, error: "noUserId" });

        let { result, blocker, blocked, msg } = await UserManager.getInstance().blockUser(req.userId, userId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, blocker, blocked });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function unblockUser(req: IUserRequest, res: Response) {
    try {
        let { userId } = req.params;
        if(!userId) return res.status(401).send({ success: false, error: "noUserId" });

        let { result, unblocker, unblocked, msg } = await UserManager.getInstance().unblockUser(req.userId, userId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, unblocker, unblocked });
    } catch (e) {
        res.status(500).send({ success: false, error: e });
    }
}

export async function filter(req: IUserRequest, res: Response) {
    try {
        let user = await UserManager.getInstance().filterUser(req.query.filter, req.query.sort);
        if(!user) return res.status(401).send({ sucess: false, error: "noUser" });

        return res.send({ success: true, user: user });
    } catch (e) {
        res.status(500).send({ success: false, error: e });
    }
}