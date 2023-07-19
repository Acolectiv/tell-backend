import { Document } from "mongoose";

export default interface IUser extends Document {
    username: String,
    email: String,
    password: String,
    createdAt: Number,
    userType: String
}