import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import UserManager from "../managers/UserManager";

router.post('/set', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { userId, permissions } = req.body;

        if(!userId || !permissions)
            return res.status(401).send({ success: false, error: "noUserIdOrPerms" });

        let { result, msg, perms } = await UserManager.getInstance().setUserPermissions(req.userId, userId, permissions);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, perms });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.post('/remove', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { userId, permissions } = req.body;

        if(!userId || !permissions)
            return res.status(401).send({ success: false, error: "noUserIdOrPerms" });

        let { result, msg, perms } = await UserManager.getInstance().removeUserPermissions(req.userId, userId, permissions);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, perms });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

router.get('/fetch/:userId', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { userId } = req.params;

        if(!userId)
            return res.status(401).send({ success: false, error: "noUserId" });

        let { result, msg, perms } = await UserManager.getInstance().getUserPermissions(userId);
        if(result == "error") return res.status(400).json({ success: false, msg });
        else return res.json({ success: true, perms });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

const permissionsRoute = router;
export default permissionsRoute;