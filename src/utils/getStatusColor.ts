import IAssemblyLine from "../interfaces/assemblyLines";

export default function getStatusColor(status: IAssemblyLine["status"]) {
    switch (status) {
        case "PENDING":
            return "#f0ad4e";
        case "OFF":
            return "#d9534f";
        case "CANCELED":
            return "#d9534f";
        case "ON":
            return "#5cb85c";
        case "ARCHIVED":
            return "#d9534f";
        default:
            return "#5bc0de";
    }
}