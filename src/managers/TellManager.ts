import { model } from "mongoose";

import TellResult from "../typings/TellResult";

import removeArrayElementById from "../utils/removeArrayElementById";
import elementExists from "../utils/elementExists";

import UserManager from "./UserManager";
const Tell = model("Tell");

class TellManager {
    private static instance: TellManager;

    private constructor() {
        console.log(`[TellManager] -> TellManager initialized.`);
    }

    public static getInstance(): TellManager {
        if(!TellManager.instance) {
            TellManager.instance = new TellManager();
        }

        return TellManager.instance;
    }

    async fetchTell(tellId: string) {
        if(!tellId) return <TellResult>{ result: "error", msg: "noTellId" };

        let tell = await Tell.findById(tellId).populate("likes").populate("dislikes");
        if(tell) return <TellResult>{ result: "success", tell };
        else return <TellResult>{ result: "error", msg: "noTellFound" };
    }

    async fetchUserTells(author: string, limit: number) {
        if(!author) return <TellResult>{ result: "error", msg: "noAuthor" };

        let tells = await Tell.find({ author }).limit(limit);

        return <TellResult>{ result: "success", tell: tells };
    }

    async postTell(author: any, text: string) {
        if(!author || !text) return <TellResult>{ result: "error", msg: "noAuthorOrText" };

        let tell = await Tell.create({
            author: author._id,
            text,
            likes: [],
            dislikes: [],
            createdAt: Date.now()
        });

        author.tells.push(tell._id);
        await author.save();

        return <TellResult>{ result: "success", tell };
    }

    async deleteTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        await Tell.deleteOne({ _id: tellId });
        author.tells = removeArrayElementById(author.tells, tellId);
        await author.save();

        return <TellResult>{ result: "success", tell: author.tells };
    }

    async likeTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        let tellRes: TellResult = await this.fetchTell(tellId);
        if(tellRes.result == "error") return <TellResult>{ result: "error", msg: tellRes.msg };

        if(elementExists(JSON.parse(JSON.stringify(tellRes.tell.likes)), author._id.toString()) || elementExists(JSON.parse(JSON.stringify(tellRes.tell.dislikes)), author._id.toString()))
            return <TellResult>{ result: "error", msg: "alreadyLikedOrDisliked" };
        else {
            tellRes.tell.likes.push(author._id);

            await tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        }
    }

    async dislikeTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        let tellRes: TellResult = await this.fetchTell(tellId);
        if(tellRes.result == "error") return <TellResult>{ result: "error", msg: tellRes.msg };

        if(elementExists(JSON.parse(JSON.stringify(tellRes.tell.likes)), author._id.toString()) || elementExists(JSON.parse(JSON.stringify(tellRes.tell.dislikes)), author._id.toString()))
            return <TellResult>{ result: "error", msg: "alreadyLikedOrDisliked" };
        else {
            tellRes.tell.dislikes.push(author._id);

            await tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        }
    }

    async removeLikeOrDislikeTell(author: any, tellId: string) {
        if(!author || !tellId) return <TellResult>{ result: "error", msg: "noAuthorOrTellId" };

        let tellRes: TellResult = await this.fetchTell(tellId);
        if(tellRes.result == "error") return <TellResult>{ result: "error", msg: tellRes.msg };

        let tellsLikes = JSON.parse(JSON.stringify(tellRes.tell.likes));
        let tellsDislikes = JSON.parse(JSON.stringify(tellRes.tell.dislikes));

        if(elementExists(tellsLikes, author._id.toString())) {
            tellRes.tell.likes = removeArrayElementById(tellsLikes, author._id.toString());

            tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        } else if(elementExists(tellsDislikes, author._id.toString())) {
            tellRes.tell.dislikes = removeArrayElementById(tellsDislikes, author._id.toString());

            tellRes.tell.save();

            return <TellResult>{ result: "success", tell: tellRes.tell };
        } else {
            return <TellResult>{ result: "error", msg: "noLike" };
        }
    }
}

export default TellManager;