import IComment from "../interfaces/IComment";

type CommentResult = 
    | { result: 'success', comment: IComment, comments: Array<IComment> }
    | { result: 'error', msg: String };

export default CommentResult;