import { model } from "mongoose";
import UserManager from "../../managers/UserManager";
const Community = model("Community");

import CommunityResult from "../../typings/CommunityResult";

import _postTellInCommunity from "./actions/postTellInCommunity";

class CommunityModule {
    private static instance: CommunityModule;

    private constructor() {
        console.log(`[CommunityModule] -> CommunityModule initialized.`);
    }

    public static getInstance(): CommunityModule {
        if(!CommunityModule.instance) {
            CommunityModule.instance = new CommunityModule();
        }

        return CommunityModule.instance;
    }

    async fetchCommunity(communityId: string, populates: Array<string>) {
        let community = await Community.findOne({ _id: communityId });

        if(community === null) return <CommunityResult>{ result: "error", msg: "noCommunity" };

        if(populates.length != 0) {
            populates.forEach(pop => {
                community.populate(pop);
            });
        };

        return <CommunityResult>{ result: "success", community };
    }

    async fetchUserCommunities(userId: string) {
        let { result, msg, user } = await UserManager.getInstance().fetchUser(userId, userId);
        if(result == "error") return <CommunityResult>{ result: "error", msg };

        return <CommunityResult>{ result: "success", communities: user.communities };
    }

    async createCommunity(userId: string, payload: any) {
        if(!payload || !payload.name || !payload.description)
            return <CommunityResult>{ result: "error", msg: "noPayload" };

        let community = await Community.create({
            owner: userId,
            members: [],
            description: payload.description,
            public: 1,
            name: payload.name,
            createdAt: Date.now()
        });

        let { result, msg, user } = await UserManager.getInstance().fetchUser(userId, userId);
        if(result == "error") return <CommunityResult>{ result: "error", msg };

        user.communities.push(community._id);
        user.save();

        return <CommunityResult>{ result: "success", community };
    }

    async postTellInCommunity(tellPayload: any, communityId: string) {
        let { tell } = await _postTellInCommunity(tellPayload, communityId);

        return { result: "success", tell };
    }
}

export default CommunityModule;