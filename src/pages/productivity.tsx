import Table from "../components/table";
import { useEffect, useState } from "react";
import ILine from "../interfaces/line";
import IProduct from "../interfaces/product";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import getStatusColor from "../utils/getStatusColor";
import IUser from "../interfaces/user";
import moment from "moment";
import getFinishPercent from "../utils/getFinishPercent";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import {LineProduction} from "../../models";
import Link from "next/link";
import instance from "@/instance";

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
    const [dateFilter, setDateFilter] = useState<{startDate: string, endDate: string}>({startDate: "", endDate: ""});
    const [globalFilter, setGlobalFilter] = useState<string>();

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
      if(dateFilter.startDate !== "" && dateFilter.endDate !== "")
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
              <input onChange={(e)=>setDateFilter({startDate: e.target.value, endDate: dateFilter.endDate})} type="date" className="border w-full placeholder:text-sm border-solid border-outline_variant rounded px-3 py-2.5" placeholder="Nhập mã khách hàng"/>
          </div>
          <div className="text-sm mr-2 w-full max-w-[170px] before:content-['-'] before:absolute before:top-0 before:translate-y-1/2 before:-left-1 before:bottom-0 before:-translate-x-full relative">
              <p className="mb-2">Đến ngày</p>
              <input onChange={(e)=>setDateFilter({startDate: dateFilter.startDate, endDate: e.target.value})} type="date" className="border w-full placeholder:text-sm border-solid border-outline_variant rounded px-3 py-2.5" placeholder="Nhập số điện thoại"/>
          </div>
          <input
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.currentTarget.value)}
                className="p-2 shadow border rounded outline-none ml-auto block"
                placeholder="Tìm kiếm sản phẩm..."
              />
        </div>
        <Table columns={columns} data={productionLogs} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
    </>
    );
}

export default PageProductivity;