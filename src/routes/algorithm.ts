import express, { Request, Response } from "express";

import IUserRequest from "../interfaces/IUserRequest";
import auth from "../middleware/auth";

const router = express.Router();

import Algorithm from "../algorithm/Algorithm";

router.get('/fetchTells', auth, async (req: IUserRequest, res: Response) => {
    try {
        const { result, tells } = await Algorithm.getInstance().fetchTells();
        if(result === 'error') return res.status(401).send({ success: false, error: "noTells" });

        console.log(tells.length)

        return res.send({ success: true, tells });
    } catch(e) {
        res.status(500).send({ success: false, error: e });
    };
});

const algorithmRoute = router;
export default algorithmRoute;