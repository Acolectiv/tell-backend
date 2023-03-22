import { Schema, model, SchemaTypes } from "mongoose";

import ICommunity from "../interfaces/ICommunity";

const CommunitySchema = new Schema<ICommunity>({
    owner: { type: SchemaTypes.ObjectId, ref: "User" },
    members: [{ type: SchemaTypes.ObjectId, ref: "User" }],
    public: Boolean,
    title: String,
    createdAt: Number,
    description: String,
    name: String
});

model<ICommunity>("Community", CommunitySchema);