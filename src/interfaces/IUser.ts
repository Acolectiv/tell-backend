export default interface IUser {
    username: String,
    email: String,
    password: String,
    tells: Array<any>,
    following: Array<any>,
    followers: Array<any>
}