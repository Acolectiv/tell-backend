import config from "./constants";

import { model } from "mongoose";
const Tell = model("Tell");

class Algorithm { 
    private static instance: Algorithm;

    private constructor() {
        console.log(`[Algorithm] -> Algorithm initialized.`);
    }

    public static getInstance(): Algorithm {
        if(!Algorithm.instance) {
            Algorithm.instance = new Algorithm();
        }

        return Algorithm.instance;
    }

    async fetchTells() {
        let tells = await Tell.aggregate([{ $sample: { size: 30 } }]).exec();

        return { result: "success", tells }
    }
}

export default Algorithm;