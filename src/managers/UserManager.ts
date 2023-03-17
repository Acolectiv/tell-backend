import { model } from "mongoose";
// @ts-ignore
import jwt from "jsonwebtoken";
// @ts-ignore
import { compare } from "bcrypt";

import IUserPayload from "../interfaces/IUserPayload";
import UserResult from "../typings/UserResult";
import IUser from "../interfaces/IUser";
import removeElementById from "../utils/removeElemntById";

const User = model("User");

class UserManager {
    private static instance: UserManager;

    private constructor() {
        console.log(`[UserManager] -> UserManager initialized.`);
    }

    public static getInstance(): UserManager {
        if(!UserManager.instance) {
            UserManager.instance = new UserManager();
        }

        return UserManager.instance;
    }

    async userExists(id: String) {
        const user: IUser = await User.findById(id);
        if(!user) return false;
        else return true;
    }

    async findUserByEmail(email: String) {
        return User.findOne({ email });
    }

    async findUserByUsername(username: string) {
        return User.findOne({ username });
    }

    async fetchUser(id: string) {
        return await User.findById(id).populate("tells").populate("notes");
    }

    async createUser(payload: IUserPayload) {
        if(!payload) return console.error(`[UserManager] -> Payload must be greater then 0.`);

        if((await this.findUserByUsername(payload.username)) != null) 
            return <UserResult>{ result: "error", msg: "user already exists" }

        const user = new User(payload);
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN);

        return <UserResult>{ result: "success", user, token };
    }

    async loginUser(payload: IUserPayload) {
        if(!payload) return console.error(`[UserManager] -> Payload must be greater then 0.`);

        const user = await this.findUserByUsername(payload.username);
        if(!user) return <UserResult>{ result: "error", msg: "user doesn't exist" };
        
        const isPasswordValid = await compare(payload.password, user.password);
        if(!isPasswordValid) return <UserResult>{ result: "error", msg: "incorrect password" };

        const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN);

        return <UserResult>{ result: "success", user, token };
    }

    async blockUser(blocker: string, blocked: string) {
        let blockerUser = await UserManager.getInstance().fetchUser(blocker);
        let blockedUser = await UserManager.getInstance().fetchUser(blocked);

        let blockerParsed = JSON.parse(JSON.stringify(blockerUser));
        let blockedParsed = JSON.parse(JSON.stringify(blockedUser));

        if(!blockerUser || !blockedUser) return { result: "error", msg: "noBlockedOrBlocked" };

        if(blockerUser._id.toString() == blockedUser._id.toString())
            return { result: "error", msg: "blockingSelf" };

        let blockerHasblocked = blockerParsed.blocked.indexOf(blockedParsed._id);
        if(blockerHasblocked != -1) return { result: "error", msg: "alreadyBlocked" };

        blockerUser.blocked.push(blockedUser._id);
        await blockerUser.save();

        return { result: "success", blocker: blockerUser._id, blocked: blockedUser._id };
    }

    async unblockUser(unblocker: string, unblocked: string) {
        let unblockerUser = await UserManager.getInstance().fetchUser(unblocker);
        let unblockedUser = await UserManager.getInstance().fetchUser(unblocked);

        let unblockerParsed = JSON.parse(JSON.stringify(unblockerUser));
        let unblockedParsed = JSON.parse(JSON.stringify(unblockedUser));

        if(!unblockerUser || !unblockedUser) return { result: 'error', msg: "noUnblockerOrUnblocked" };

        if(unblockerUser._id.toString() == unblockedUser._id.toString())
            return { result: "error", msg: "unblockingSelf" };

        let unblockerHasblocked = unblockerParsed.blocked.indexOf(unblockedParsed._id);

        if(unblockerHasblocked == -1)
            return { result: "error", msg: "alreadyUnblocked" };

        unblockerUser.blocked = removeElementById(unblockerParsed.blocked, unblockedUser._id);

        await unblockerUser.save();

        return { result: "success", unblocker: unblockerUser._id, unblocked: unblockedUser._id };
    }
}

export default UserManager;