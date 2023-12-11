import * as XLSX from 'xlsx';
import moment from 'moment';
import getFinishPercent from '@/utils/getFinishPercent';

export default function ExcelDownloader(data: any, fileName: string, heading: string[] = []) {
    heading = ["STT", "Ngày", "Dây chuyền","Giờ bắt đầu","Giờ kết thúc", "Sản phẩm", "Ca", "Mục tiêu", "Đã hoàn thành", "Tiến độ", "Số lượng công nhân", "PIC", "Ghi chú"]

    data = data.map((item: { id: any; date: moment.MomentInput; line: { name: any; }; start_time: any; end_time: any; product: { name: any; target: any; }; shift: any; finish: any; worker_count: any; manager: { name: any; }; note: string; })=>{
        return {
            "STT": item.id,
            "Ngày": moment(item.date).format("DD/MM/YYYY"),
            "Dây chuyền": item.line.name,
            "Giờ bắt đầu": item.start_time,
            "Giờ kết thúc": item.end_time,
            "Sản phẩm": item.product.name,
            "Ca": item.shift,
            "Mục tiêu": item.product.target,
            "Đã hoàn thành": item.finish,
            "Tiến độ": getFinishPercent(item.finish, item.product.target) + "%",
            "Số lượng công nhân": item.worker_count,
            "PIC": item.manager.name,
            "Ghi chú": item.note && JSON.parse(item.note)?.length > 0 ? JSON.parse(item.note)?.join(", ") : "",
        }
    })

    const currentDateTime = new Date().toISOString().slice(0, 19).replace(/-/g, "").replace(/:/g, "").replace("T", "_");
    const name = `${fileName || 'Output'}-${currentDateTime}.xlsx`;
    //@ts-ignore
    const worksheet = XLSX.utils.json_to_sheet(data, { origin: 'A2', skipHeader: true });
    XLSX.utils.sheet_add_aoa(worksheet, [heading], { origin: 'A1' });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workbook, name);
};