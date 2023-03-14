import ITell from "../interfaces/ITell";

type TellResult = 
    | { result: 'success', tell: any }
    | { result: 'error', msg: String };

export default TellResult;