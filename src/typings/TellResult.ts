import ITell from "../interfaces/ITell";

type TellResult = 
    | { result: 'success', tell: ITell }
    | { result: 'error', msg: String };

export default TellResult;