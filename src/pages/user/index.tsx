import { useState } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import Table from "@/components/table";
import { toast } from "react-toastify";
import IUser from "@/interfaces/user";
import instance from "@/instance";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { User } from "../../../models";

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

    const users = await User.findAll()

    return {
        props: { usersRaw: JSON.stringify(users) }
    }
}

function PageUser({ usersRaw }: { usersRaw: string }) {
    const [users, setUsers] = useState<IUser[]>(JSON.parse(usersRaw));

    const handleRemove = useMemo(() => async (id: number | string) => 
        {
            if(!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
            await instance.delete(`/users/${id}`);
            setUsers(users.filter(user => user.id !== id));
            toast.success("Xóa người dùng thành công");
        },
    [users]);

    const columnHelper = useMemo(() => createColumnHelper<IUser>(), []);

    const columns = useMemo(
        () => [
            {
                id: "index",
                header: "STT",
                cell: ({ row }) => row.index + 1,
            },
            columnHelper.accessor("name", {
                header: "Tên người dùng",
                cell: ({ row }) => <Link className='text-blue-500' href={`/user/${row.original.id}`}>{row.original.name}</Link>,
            }),
            columnHelper.accessor("username", {
                header: "Mã người dùng",
            }),
            columnHelper.accessor("note", {
                header: "Ghi chú",
            }),
            columnHelper.accessor("role", {
                header: "Vai trò",
                cell: ({ cell }) => cell.getValue() === "manager" ? "giám sát online" : cell.getValue()
            }),
            {
                id: "action",
                header: "Hành động",
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Link href={`/user/${row.original.id}`} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center">Sửa</Link>
                        <button onClick={() => handleRemove(row.original.id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5 text-center ml-2">Xóa</button>
                    </div>
                ),
            }
        ] as Array<ColumnDef<IUser, unknown>>, [columnHelper, handleRemove]
      );
    
    return (
    <>
        <h1 className="text-center text-5xl font-bold mb-12">Danh sách người dùng</h1>
        <Link href="/user/new" className="text-white bg-blue-700 hover:bg-blue-800 block w-fit mb-2 ml-auto focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center">Thêm người dùng</Link>
        <Table columns={columns} data={users} />
    </>
    );
}

export default PageUser;