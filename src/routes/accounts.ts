import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import IUser from "../interfaces/IUser";
import UserResult from "../typings/UserResult";

const router = express.Router();

import UserManager from "../managers/UserManager";
import auth from "../middleware/auth";

router.post('/create', async (req: IUserRequest, res: Response) => {
    try {
        const { email, password, username } = req.body;

        if(!email || !password || !username)
            return res.status(401).send({ success: false, error: "email, password, username empty." });

        const userRes: UserResult = await UserManager.getInstance().createUser({ email, password, username }) as any;
        if(userRes.result === 'error') return res.status(401).send({ success: false, error: userRes.msg });

        return res.send({ user: userRes.user, token: userRes.token });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/login', async (req: IUserRequest, res: Response) => {
    try {
        const { username, password } = req.body;

        if(!username || !password)
            return res.status(401).send({ success: false, error: "username, password empty." });

        const userRes: UserResult = await UserManager.getInstance().loginUser({ username, password }) as any;
        if(userRes.result === 'error') return res.status(401).send({ success: false, error: userRes.msg });

        return res.send({ user: userRes.user, token: userRes.token });
    } catch(e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    }
});

router.get('/fetch/:userId', async (req: IUserRequest, res: Response) => {
    try {
        let userId = req.params.userId;
        if(!userId) return res.status(401).send({ success: false, error: "no userId was provided" });

        let user = await UserManager.getInstance().fetchUser(userId);
        if(!user) return res.status(401).send({ sucess: false, error: "account with that username doesn't exist" });

        return res.send({ success: true, user: user });
    } catch (e) {
        console.log(e);
        res.status(500).send({ success: false, error: e });
    }
});

router.post('/block/:userId', auth, async (req: IUserRequest, res: Response) => {
    let { userId } = req.params;
    if(!userId) return res.status(401).send({ success: false, error: "no userId was provided" });

    let { result, blocker, blocked, msg } = await UserManager.getInstance().blockUser(req.userId, userId);
    if(result == "error") return res.status(400).json({ success: false, msg });
    else return res.json({ success: true, blocker, blocked });
});

router.post('/unblock/:userId', auth, async (req: IUserRequest, res: Response) => {
    let { userId } = req.params;
    if(!userId) return res.status(401).send({ success: false, error: "no userId was provided" });

    let { result, unblocker, unblocked, msg } = await UserManager.getInstance().unblockUser(req.userId, userId);
    if(result == "error") return res.status(400).json({ success: false, msg });
    else return res.json({ success: true, unblocker, unblocked });
});

const accountsRoute = router;
export default accountsRoute;