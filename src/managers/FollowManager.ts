import removeElementById from "../utils/removeElemntById";
import UserManager from "./UserManager";

class FollowManager {
    private static instance: FollowManager;

    private constructor() {
        console.log(`[FollowManager] -> FollowManager initialized.`);
    }

    public static getInstance(): FollowManager {
        if(!FollowManager.instance) {
            FollowManager.instance = new FollowManager();
        }

        return FollowManager.instance;
    }

    async followUser(follower: string, followed: string) {
        let { result: res1, msg: message1, user: followerUser } = await UserManager.getInstance().fetchUser(follower, followed);
        if(res1 == "error") return { result: "error", msg: message1 };

        let { result: res, msg: message, user: followedUser } = await UserManager.getInstance().fetchUser(follower, followed);
        if(res == "error") return { result: "error", msg: message };

        let followerParsed = JSON.parse(JSON.stringify(followerUser));
        let followedParsed = JSON.parse(JSON.stringify(followedUser));

        if(!followedUser || !followerUser) return { result: 'error', msg: "noFollowerOrFollowed" };

        if(followerUser._id.toString() == followedUser._id.toString())
            return { result: "error", msg: "followingSelf" };

        let followerHasFollowed = followerParsed.following.indexOf(followedParsed._id);

        if(followerHasFollowed != -1)
            return { result: "error", msg: "alreadyFollowing" };

        followerUser.following.push(followedUser._id);
        followedUser.followers.push(followerUser._id);

        await followerUser.save();
        await followedUser.save();

        return { result: "success", follower: followerUser._id, followed: followedUser._id };
    }

    async unfollowUser(unfollower: string, unfollowed: string) {
        let { result: res1, msg: message1, user: unfollowerUser } = await UserManager.getInstance().fetchUser(unfollower, unfollowed);
        if(res1 == "error") return { result: "error", msg: message1 };

        let { result: res, msg: message, user: unfollowedUser } = await UserManager.getInstance().fetchUser(unfollowed, unfollowed);
        if(res == "error") return { result: "error", msg: message };

        let unfollowerParsed = JSON.parse(JSON.stringify(unfollowerUser));
        let unfollowedParsed = JSON.parse(JSON.stringify(unfollowedUser));

        if(!unfollowerUser || !unfollowedUser) return { result: 'error', msg: "noUnfollowerOrUnfollowed" };

        if(unfollowerUser._id.toString() == unfollowedUser._id.toString())
            return { result: "error", msg: "unfollowingSelf" };

        let unfollowerHasUnfollowed = unfollowerParsed.following.indexOf(unfollowedParsed._id);

        if(unfollowerHasUnfollowed == -1)
            return { result: "error", msg: "alreadyUnfollowing" };

        unfollowerUser.following = removeElementById(unfollowerUser.following, unfollowedParsed._id);
        unfollowedUser.followers = removeElementById(unfollowedUser.followers, unfollowerParsed._id);

        await unfollowerUser.save();
        await unfollowedUser.save();

        return { result: "success", unfollower: unfollowerUser._id, unfollowed: unfollowedUser._id };
    }

    async fetchFollowers(fetcher: string, userId: string) {
        if(!userId) return { result: 'error', msg: "noUserId" };

        let { user } = await UserManager.getInstance().fetchUser(fetcher, userId);

        return user.followers || [];
    }

    async fetchFollowing(fetcher: string, userId: string) {
        if(!userId) return { result: 'error', msg: "noUserId" };

        let { user } = await UserManager.getInstance().fetchUser(fetcher, userId);

        return user.following || [];
    }
};

export default FollowManager;