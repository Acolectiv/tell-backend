import IUser from "../interfaces/IUser";

type UserResult = 
    | { result: 'success', user: IUser, token?: String }
    | { result: 'error', msg: String };

export default UserResult;