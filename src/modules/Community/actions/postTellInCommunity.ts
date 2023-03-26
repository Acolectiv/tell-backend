import TellManager from "../../../managers/TellManager";

export default async function _postTellInCommunity(tellPayload: any, communityId: string) {
    let tell = await TellManager.getInstance().postTell(
        tellPayload.author,
        tellPayload.text,
        tellPayload.title,
        communityId
    );

    return { result: "success", tell };
}