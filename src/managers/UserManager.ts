import { model } from "mongoose";
// @ts-ignore
import jwt from "jsonwebtoken";
// @ts-ignore
import { compare } from "bcrypt";

import IUserPayload from "../interfaces/IUserPayload";
import UserResult from "../typings/UserResult";
import IUser from "../interfaces/IUser";

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
        return <IUser>(await User.findById(id).populate("tells"));
    }

    async createUser(payload: IUserPayload) {
        console.log(payload);
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
}

export default UserManager;