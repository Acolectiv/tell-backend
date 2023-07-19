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
    userType: { type: String, default: "Regular" }
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