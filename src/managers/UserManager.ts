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

function hasWhiteSpace(s: string) {
    return s.indexOf(' ') >= 0;
}

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

    async fetchUser(fetcher: string, id: string) {
        let user = await User.findById(id).populate("tells").populate("notes");
        if(!user) return { result: "error", msg: "noUser" };

        if(user.blocked.includes(fetcher))
            return { result: "error", msg: "fetcherBlockedByFetched" };

        return { result: "success", user };
    }

    async createUser(payload: IUserPayload) {
        if(!payload) return console.error(`[UserManager] -> Payload must be greater then 0.`);

        if((await this.findUserByUsername(payload.username)) != null) 
            return <UserResult>{ result: "error", msg: "user already exists" };

        if(hasWhiteSpace(payload.username)) return <UserResult>{ result: "error", msg: "noWhiteSpacesAllowed" };
        if(payload.username.length > 64) return <UserResult>{ result: "error", msg: "usernameOver64Chars" }

        if(payload.permissions || payload.isOwner) {
            delete payload.permissions;
            delete payload.isOwner;
        }

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

        const token = jwt.sign({ userId: user._id, isOwner: user.isOwner, permissions: user.permissions }, process.env.JWT_TOKEN);

        return <UserResult>{ result: "success", user, token };
    }

    async blockUser(blocker: string, blocked: string) {
        let { result: res1, msg: message1, user: blockerUser } = await UserManager.getInstance().fetchUser(blocker, blocker);
        if(res1 == "error") return { result: "error", msg: message1 };

        let { result: res, msg: message, user: blockedUser } = await UserManager.getInstance().fetchUser(blocked, blocked);
        if(res == "error") return { result: "error", msg: message };

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
        let { result: res1, msg: message1, user: unblockerUser } = await UserManager.getInstance().fetchUser(unblocker, unblocker);
        if(res1 == "error") return { result: "error", msg: message1 };

        let { result: res, msg: message, user: unblockedUser } = await UserManager.getInstance().fetchUser(unblocked, unblocked);
        if(res == "error") return { result: "error", msg: message };

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

    async filterUser(filter: any, sort: any): Promise<any> {
        return await User.find(filter).sort(sort);
    }

    async getUserPermissions(userId: string): Promise<object> {
        let { result, msg, user } = await UserManager.getInstance().fetchUser(userId, userId);
        if(result == "error") return { result: "error", msg };

        return { ...user.isOwner, ...user.permissions };
    }

    async checkUserPermissions(userId: string, perms: string | Array<string>): Promise<boolean | object> {
        let { result, msg, user } = await UserManager.getInstance().fetchUser(userId, userId);
        if(result == "error") return { result: "error", msg };

        if(typeof perms == "string") {
            if(user.isOwner) return true;
            if(user.permissions[perms] === true) return true;

            return false;
        } else {
            if(user.isOwner) return true;
            perms.forEach(perm => {
                if(user.permissions[perm] === false) return false;
            });

            return true;
        }
    }

    async setUserPermissions(authorId: string, userId: string, perms: string | Array<string>): Promise<object> {
        let { result: res1, msg: msg1, user: user1 } = await UserManager.getInstance().fetchUser(authorId, authorId);
        if(res1 == "error") return { result: "error", msg1 };

        if(user1.isOwner === false) return { result: "error", msg: "isOwnerFalse" };

        let { result, msg, user } = await UserManager.getInstance().fetchUser(userId, userId);
        if(result == "error") return { result: "error", msg };

        if(perms == "isOwner" || perms.includes("isOwner")) return { result: "error", msg: "noIsOwner" };

        if(typeof perms == "string") {
            user.permissions[perms] = true;
        } else {
            perms.forEach(perm => {
                user.permissions[perm] = true;
            });
        };

        user.save();

        return { result: "success", perms }
    }
}

export default UserManager;