import { Schema, model, SchemaTypes } from "mongoose";
import { NextFunction } from "express";

import IUser from "../interfaces/IUser";

// @ts-ignore
import { hash } from "bcrypt";

const UserSchema = new Schema<IUser>({
    username: String,
    email: String,
    password: String,
    tells: [{ type: SchemaTypes.ObjectId, ref: "Tell" }],
    following: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    followers: [{ type: SchemaTypes.ObjectId, ref: "User" }]
});

UserSchema.pre("save", async function(next: NextFunction) {
    const user = this;

    if(user.isModified("password")) {
        user.password = await hash(user.password, 10);
    };

    next();
});

model<IUser>("User", UserSchema);