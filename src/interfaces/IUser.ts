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
    notifications: Array<any>,
    communities: Array<any>,
    isOwner: boolean,
    permissions: object,
    gcs: Array<any>,
    interests: Array<any>,
    socketId: String,
    isOnline: boolean,
    presence: string,
    friendRequests: any[],
    friends: any[],
    rooms: any[]
}