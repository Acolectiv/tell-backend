import { Schema, model, SchemaTypes } from "mongoose";
import { NextFunction } from "express";

import IUser from "../interfaces/IUser";

// @ts-ignore
import { hash } from "bcrypt";

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        maxlength: 64
    },
    email: String,
    password: String,
    createdAt: Number,
    tells: [{ type: SchemaTypes.ObjectId, ref: "Tell" }],
    following: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    followers: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    blocked: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    notes: { type: SchemaTypes.ObjectId, ref: "UserNote" },
    notifications: [{ type: SchemaTypes.ObjectId, ref: "Notification" }],
    communities: [{ type: SchemaTypes.ObjectId, ref: "Community" }],
    isOwner: { type: Boolean, default: false },
    permissions: {
        banUser: { type: Boolean, default: false },
        deleteTell: { type: Boolean, default: false },
        seeUsers: { type: Boolean, default: false },
        adminPanel: { type: Boolean, default: false },
        seePastSanctions: { type: Boolean, default: false }
    }
});

UserSchema.pre("save", async function(next: NextFunction) {
    const user = this;

    if(user.isModified("password")) {
        user.password = await hash(user.password, 10);
    };

    if(user.isModified("createdAt")) {
        user.createdAt = Date.now();
    };

    next();
});

model<IUser>("User", UserSchema);