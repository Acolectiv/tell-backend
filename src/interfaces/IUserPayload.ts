export default interface IUserPayload {
    email?: string,
    password?: string,
    username?: string,
    permissions?: object,
    isOwner?: boolean
}