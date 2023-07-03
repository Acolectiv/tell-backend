import { Socket } from "socket.io";

import jwt from "jsonwebtoken";

import { model } from "mongoose";

const User = model("User");
import IUser from "../interfaces/IUser";

class AuthHandler {
    public static async authenticateUser(socket: Socket): Promise <IUser | null> {
        if(!socket.handshake.headers['authorization']) return null;

        const decoded = jwt.verify(socket.handshake.headers['authorization'], process.env.JWT_TOKEN) as any;
    
        let user = await User.findById(decoded.userId);

        if(user) return user;
        else return null;
    }
}

export default AuthHandler;