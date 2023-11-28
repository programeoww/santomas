import * as XLSX from 'xlsx';

export default function ExcelDownloader(data: any, fileName: string, heading: string[] = []) {
    data.map((item: any) => {
        delete item.search_query
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