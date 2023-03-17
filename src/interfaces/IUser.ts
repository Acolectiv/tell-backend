import { Document } from "mongoose";

export default interface IUser extends Document {
    username: String,
    email: String,
    password: String,
    createdAt: Number,
    tells: Array<any>,
    following: Array<any>,
    followers: Array<any>,
    blocked: Array<any>,
    notes: any,
    notifications: Array<any>
}