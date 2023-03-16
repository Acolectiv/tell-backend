import IUserNote from "../interfaces/IUserNote";
import { model } from "mongoose";

const UserNote = model("UserNote");

import UserManager from "./UserManager";

class NotesManager {
    private static instance: NotesManager;

    private constructor() {
        console.log(`[NotesManager] -> NotesManager initialized.`);
    }

    public static getInstance(): NotesManager {
        if(!NotesManager.instance) {
            NotesManager.instance = new NotesManager();
        }

        return NotesManager.instance;
    }

    async fetchNote(noteId: string) {
        let note = await UserNote.findById(noteId);
        if(note === null) return { result: "error", msg: "noNote" };
        else return { result: "success", note }; 
    }

    async postNote(author: string, text: string) {
        let user = await UserManager.getInstance().fetchUser(author);
        if(user === null) return { result: "error", msg: "noUser" };

        if(!text) return { result: "error", msg: "noText" };

        let note = await UserNote.create({
            author,
            text,
            createdAt: Date.now()
        });

        user.notes = note._id;

        await user.save();

        return { result: "success", note };
    }

    async deleteNote(author: string, noteId: string) {
        let user = await UserManager.getInstance().fetchUser(author);
        if(user === null) return { result: "error", msg: "noUser" };

        if(!noteId) return { result: "error", msg: "noNoteId" };

        let { result, msg, note } = await this.fetchNote(noteId);
        if(result == "error") return { result: "error", msg };

        console.log(author, note)

        if(author != note.author.toString()) return { result: "error", msg: "noPermission" };

        await UserNote.deleteOne({ _id: noteId });

        user.notes = {};

        await user.save();

        return { result: "success", note: user.notes };
    }

    async editNote(author: string, noteId: string, text: string) {
        if(!noteId) return { result: "error", msg: "noNoteId" };
        if(!text) return { result: "error", msg: "noText" };

        let { result, msg, note } = await this.fetchNote(noteId);
        if(result == "error") return { result: "error", msg };

        if(author != note.author.toString()) return { result: "error", msg: "noPermission" };

        note.text = text;

        await note.save();

        return { result: "success", note: note };
    }
}

export default NotesManager;