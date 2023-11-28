import Table from "../components/table";
import { useEffect, useState } from "react";
import ILine from "../interfaces/line";
import IProduct from "../interfaces/product";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import IUser from "../interfaces/user";
import moment from "moment";
import getFinishPercent from "../utils/getFinishPercent";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import {LineProduction} from "../../models";
import instance from "@/instance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExcelDownloader from "@/components/ExcelDownloader";

type ILineWithRelationship = ILine & {
    product: IProduct;
    manager: IUser;
    note: string;
    line: ILine;
    worker_count: number;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context)
  if(!session) {
      return {
          redirect: {
              destination: '/',
              permanent: false
          }
      }
  }

  if(session.user.role !== "admin") {
    return {
        redirect: {
            destination: '/404',
            permanent: false,
        }
    }
  }

  const productionLogs = await LineProduction.findAll({
      include: [
          {
              association: "product"
          },
          {
              association: "manager"
          },
          {
            association: "line"
          }
      ],
      order: [
          ["createdAt", "DESC"]
      ]
  })

  return {
      props: { productionLogsRaw: JSON.stringify(productionLogs) }
  }
}

function PageProductivity({ productionLogsRaw }: { productionLogsRaw: string }) {
    const [productionLogs, setProductionLogs] = useState<ILineWithRelationship[]>(JSON.parse(productionLogsRaw));
    const [dateFilter, setDateFilter] = useState<{startDate: Date | null, endDate: Date | null}>({startDate: null, endDate: null});
    const [globalFilter, setGlobalFilter] = useState<string>();
    const columnNames: string[] = Object.keys(productionLogs[0] ?? [])  

    const columnHelper = useMemo(() => createColumnHelper<ILineWithRelationship>(), []);

    const columns = useMemo(
        () => [
          {
            id: "index",
            header: "STT",
            cell: ({ row }) => row.index + 1,
          },
          columnHelper.accessor("createdAt", {
            header: "Ngày",
            cell: ({ row }) => <p className="text-sm">{moment(row.original.createdAt).format("DD-MM-YYYY")}</p>
          }),
          columnHelper.accessor("line.name", {
            header: "Dây chuyền",
          }),
          columnHelper.accessor("start_time", {
            header: "Giờ bắt đầu",
            cell: ({ cell }) => <p className="text-sm">{cell.getValue()}</p>
          }),
          columnHelper.accessor("end_time", {
            header: "Giờ kết thúc",
            cell: ({ cell }) => <p className="text-sm">{cell.getValue()}</p>
          }),
          columnHelper.accessor("product.name", {
            header: "Sản phẩm",
          }),
          columnHelper.accessor("shift", {
            header: "Ca",
          }),
          columnHelper.accessor("product.target", {
            header: "Mục tiêu",
          }),
          columnHelper.accessor("finish", {
            header: "Đã hoàn thành",
          }),
          {
            id: "percent",
            header: "Tiến độ",
            cell: ({ row }) => (getFinishPercent(row.original.finish, row.original.product.target) + "%")
          },
          columnHelper.accessor("worker_count", {
            header: "Số lượng công nhân",
          }),
          columnHelper.accessor("manager.name", {
            header: "PIC",
          }),
          columnHelper.accessor("note", {
            header: "Ghi chú",
            cell: ({ cell }) => <p className="min-w-[200px] whitespace-break-spaces">{cell.getValue() && JSON.parse(cell.getValue() || "")?.length > 0 ? JSON.parse(cell.getValue())?.join(", ") : ""}</p>,
          }),
        ] as Array<ColumnDef<ILineWithRelationship, unknown>>, [columnHelper]
      );

    useEffect(() => {
      if(dateFilter.startDate && dateFilter.endDate)
        (async () => {
            const { data: {data} } = await instance.get("/line-productions");
            const filteredData = data.filter((assemblyLine: ILineWithRelationship) => {
                const startDate = moment(dateFilter.startDate);
                const endDate = moment(dateFilter.endDate);
                const assemblyLineDate = moment(assemblyLine.createdAt);
                
                return assemblyLineDate.isBetween(startDate, endDate, undefined, '[]') || (assemblyLineDate.isSame(startDate, 'day') && assemblyLineDate.isSame(endDate, 'day'));
            });

            setProductionLogs(filteredData);
        })();
    }, [dateFilter])

    return (
    <>
        <h1 className="text-center text-5xl font-bold mb-12">Báo cáo lắp ráp</h1>
        <div className="flex items-end mb-4">
          <div className="text-sm mr-4 w-full max-w-[170px]">
              <p className="mb-2">Từ ngày</p>
              <DatePicker selected={dateFilter.startDate} onChange={(date)=>setDateFilter({startDate: date, endDate: dateFilter.endDate})} className="border w-full placeholder:text-sm border-solid border-outline_variant rounded px-3 py-2.5" placeholderText="Tất cả"/>
          </div>
          <div className="text-sm mr-2 w-full max-w-[170px] before:content-['-'] before:absolute before:top-0 before:translate-y-1/2 before:-left-1 before:bottom-0 before:-translate-x-full relative">
              <p className="mb-2">Đến ngày</p>
              <DatePicker selected={dateFilter.endDate} onChange={(date)=>setDateFilter({startDate: dateFilter.startDate, endDate: date})} className="border w-full placeholder:text-sm border-solid border-outline_variant rounded px-3 py-2.5" placeholderText="Tất cả"/>
          </div>
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.currentTarget.value)}
            className="p-2 shadow border rounded outline-none ml-2 block"
            placeholder="Tìm kiếm sản phẩm..."
          />
          <button onClick={()=>ExcelDownloader(productionLogs, 'export', columnNames)} className="text-[#20744A] flex ml-auto py-2 shrink-0 px-5 bg-[#20744A] bg-opacity-[0.11] rounded text-sm font-semibold hover:bg-opacity-30 duration-75 items-center mr-2">
              <svg className={'text-[#20744A] mr-2'} width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M21.5858 3.30374H13.9882V1.51349L1.5 3.44099V20.3362L13.9882 22.4872V19.8337H21.5858C21.8158 19.8454 22.0412 19.7655 22.2125 19.6114C22.3839 19.4574 22.4872 19.2418 22.5 19.0117V4.12499C22.487 3.89509 22.3836 3.67966 22.2123 3.52578C22.041 3.37191 21.8157 3.29208 21.5858 3.30374ZM21.7057 19.1482H13.9628L13.95 17.7315H15.8153V16.0815H13.9357L13.9268 15.1065H15.8153V13.4565H13.9125L13.9035 12.4815H15.8153V10.8315H13.8975V9.85649H15.8153V8.20649H13.8975V7.23149H15.8153V5.58149H13.8975V4.08149H21.7057V19.1482Z" fill="currentColor" />
                  <path d="M16.8652 5.57925H20.1075V7.22925H16.8652V5.57925ZM16.8652 8.205H20.1075V9.855H16.8652V8.205ZM16.8652 10.8308H20.1075V12.4808H16.8652V10.8308ZM16.8652 13.4565H20.1075V15.1065H16.8652V13.4565ZM16.8652 16.0823H20.1075V17.7323H16.8652V16.0823Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.76025 8.00476L6.36975 7.91251L7.3815 10.6943L8.577 7.79776L10.1865 7.70551L8.232 11.655L10.1865 15.6143L8.48475 15.4995L7.33575 12.4815L6.186 15.3848L4.62225 15.2468L6.43875 11.7495L4.76025 8.00476Z" fill="white" />
              </svg>
              <span>Export excel</span>
          </button>
        </div>
        <Table columns={columns} data={productionLogs} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
    </>
    );
}

export default PageProductivity;