export default interface IUser {
    id: number | string
    username: string
    password: string
    role: "admin" | "worker" | "manager" | "tivi"
    name: string
    note: string
    createdAt: string
    updatedAt: string
}