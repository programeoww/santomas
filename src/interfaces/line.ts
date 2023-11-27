import IProduct from "./product"
import IUser from "./user"

export default interface ILine {
    id: string | number
    name: string
    product_id: number | string
    manager_id: string | number
    finish: number | string
    shift: "MS" | "NS" | "AS" | "ALL"
    createdAt: string
    startAt: string
    endAt: string
    end_time: string
    start_time: string
    rest_time_start: string
    rest_time_end: string
    status: "PENDING" | "OFF" | "CANCELED" | "ON" | "ARCHIVED",
    workers?: IUser[]
    note?: string[]
    product?: IProduct
    workerId?: (string | number)[]
}