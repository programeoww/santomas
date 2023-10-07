import IUser from "../interfaces/user";

export default function getWorkerObjectById(id: string | number, data: IUser[]) {
    return data.find((item) => item.id === id);
}