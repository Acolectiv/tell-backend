import ICommunity from "../interfaces/ICommunity";

type CommunityResult = 
    | { result: 'success', community?: ICommunity, communities?: Array<ICommunity> }
    | { result: 'error', msg: String };

export default CommunityResult;