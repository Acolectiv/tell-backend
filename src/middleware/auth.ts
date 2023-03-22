import jwt from "jsonwebtoken";

import { Response, NextFunction } from "express";
import IUserRequest from "../interfaces/IUserRequest";

const auth = (req: IUserRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).send({ success: false, error: "no token provided" });
    };

    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN) as any;
        req.userId = decoded.userId;
        next();
    } catch(e) {
        res.status(400).send({ success: false, error: "invalid token" });
    };
};

export default auth;