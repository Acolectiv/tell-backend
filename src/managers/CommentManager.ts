import { model } from "mongoose";
import removeElementById from "../utils/removeElemntById";

const Comment = model("Comment");
const Tell = model("Tell");

import TellManager from "./TellManager";

class CommentManager {
    private static instance: CommentManager;

    private constructor() {
        console.log(`[CommentManager] -> CommentManager initialized.`);
    }

    public static getInstance(): CommentManager {
        if(!CommentManager.instance) {
            CommentManager.instance = new CommentManager();
        }

        return CommentManager.instance;
    }

    async fetchComment(commentId: string) {
        return await Comment.findById(commentId);
    }

    async fetchComments(tellId: string, limit: number) {
        let tell = await Tell.findById({ _id: tellId }).limit(limit).populate("comments");

        return tell.comments;
    }

    async postComment(tellId: string, payload: any) {
        let tellRes = await TellManager.getInstance().fetchTell(tellId);
        if(tellRes.result == "error") return { result: "error", msg: "noTell" };

        if(!payload) return { result: "error", msg: "noPayload" };

        let comment = await Comment.create({
            author: payload.author,
            parent: tellId,
            text: payload.text,
            createdAt: Date.now(),
            likes: [],
            dislikes: []
        });

        tellRes.tell.comments.push(comment._id);
        await tellRes.tell.save();

        return { result: "success", comment };
    }

    async deleteComment(deleter: string, commentId: string) {
        if(!deleter || !commentId) return { result: "error", msg: "noDeleterOrCommentId" };

        let comment = await this.fetchComment(commentId);
        if(comment === null) return { result: "error", msg: "noComment" };

        let tellRes = await TellManager.getInstance().fetchTell(comment.parent);
        if(tellRes.result == "error") return { result: "error", msg: "noTell" };

        if(comment.author.toString() != deleter) return { result: "error", msg: "noPermission" };

        await Comment.deleteOne({ _id: commentId });
        console.log(JSON.parse(JSON.stringify(tellRes.tell.comments)), commentId)
        tellRes.tell.comments = removeElementById(JSON.parse(JSON.stringify(tellRes.tell.comments)), commentId);
        await tellRes.tell.save();

        return { result: "success", comments: tellRes.tell.comments };
    }
}

export default CommentManager;