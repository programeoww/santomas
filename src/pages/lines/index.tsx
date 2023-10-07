import { useState } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import instance from "@/instance"; 
import Table from "../../components/table";
import { toast } from "react-toastify";
import ILine from "@/interfaces/line";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import { Line } from "../../../models";
import { Op } from "sequelize";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const session = await getSession(context)
    if(!session) {
        return {
            redirect: {
                destination: '/login',
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

    const assemblyLines = await Line.findAll({
        where: {
            status: {
                [Op.not]: "ARCHIVED"
            }
        }
    })

    return {
        props: { assemblyLinesRaw: JSON.stringify(assemblyLines) }
    }
}

function PageAssemblyLineList({ assemblyLinesRaw }: { assemblyLinesRaw: string }) {
    const [assemblyLines, setAssemblyLines] = useState<ILine[]>(JSON.parse(assemblyLinesRaw));

    const handleRemove = useMemo(() => async (id: number | string) => 
        {
            if(!window.confirm("Bạn có chắc chắn muốn xóa dây chuyền này?")) return;
            try {
                await instance.delete(`/lines/${id}`);
                setAssemblyLines(assemblyLines.filter(assemblyLine => assemblyLine.id !== id));
                toast.success("Xóa dây chuyền thành công!");
            } catch (error) {
                toast.error("Xóa dây chuyền thất bại!");
            }
        },
    [assemblyLines]);

    const columnHelper = useMemo(() => createColumnHelper<ILine>(), []);

    const columns = useMemo(
        () => [
            {
                id: "index",
                header: "STT",
                cell: ({ row }) => row.index + 1,
            },
            columnHelper.accessor("name", {
                header: "Tên dây chuyền",
                cell: ({ row }) => <Link className='text-blue-500' href={`/lines/${row.original.id}`}>{row.original.name}</Link>,
            }),
            {
                id: "action",
                header: "Hành động",
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Link href={`/lines/${row.original.id}`} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center">Sửa</Link>
                        <button onClick={() => handleRemove(row.original.id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5 text-center ml-2">Xóa</button>
                    </div>
                ),
            }
        ] as Array<ColumnDef<ILine, unknown>>, [columnHelper, handleRemove]
      );
    
    return (
    <>
        <h1 className="text-center text-5xl font-bold mb-12">Danh sách dây chuyền</h1>
        <Link href="/lines/new" className="text-white bg-blue-700 hover:bg-blue-800 block w-fit mb-2 ml-auto focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center">Thêm dây chuyền</Link>
        <Table columns={columns} data={assemblyLines} />
    </>
    );
}

export default PageAssemblyLineList;