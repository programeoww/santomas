import * as XLSX from 'xlsx';
import moment from 'moment';
import getFinishPercent from '@/utils/getFinishPercent';

export default function ExcelDownloader(data: any, fileName: string, heading: string[] = []) {
    heading = ["STT", "Ngày", "Dây chuyền","Giờ bắt đầu","Giờ kết thúc", "Giờ bắt đầu tạm dừng", "Giờ kết thúc tạm dừng", "Sản phẩm", "Ca", "Mục tiêu", "Đã hoàn thành", "Tiến độ", "Số lượng công nhân", "PIC", "Ghi chú", 'Đạt / Không đạt']

    data = data.map((item: {
        rest_time_start: any;
        rest_time_end: any; id: any; date: moment.MomentInput; line: { name: any; }; start_time: any; end_time: any; product: { name: any; target: any; }; shift: any; finish: any; worker_count: any; manager: { name: any; }; note: string; 
})=>{
        return {
            "STT": item.id,
            "Ngày": moment(item.date).format("DD/MM/YYYY"),
            "Dây chuyền": item.line.name,
            "Giờ bắt đầu": item.start_time,
            "Giờ kết thúc": item.end_time,
            "Giờ bắt đầu tạm dừng": moment(item.rest_time_start).format("HH:mm:ss"),
            "Giờ kết thúc tạm dừng": moment(item.rest_time_end).format("HH:mm:ss"),
            "Sản phẩm": item.product.name,
            "Ca": item.shift,
            "Mục tiêu": item.product.target,
            "Đã hoàn thành": item.finish,
            "Tiến độ": getFinishPercent(item.finish, item.product.target) + "%",
            "Số lượng công nhân": item.worker_count,
            "PIC": item.manager.name,
            "Ghi chú": item.note && JSON.parse(item.note)?.length > 0 ? JSON.parse(item.note)?.join(", ") : "",
            "Đạt / Không đạt": item.finish >= item.product.target ? "Đạt tiến độ" : "Chưa đạt tiến độ"
        }
    }).reverse();

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