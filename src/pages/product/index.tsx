import { useState } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import IProduct from "@/interfaces/product";
import instance from "@/instance"; 
import Table from "@/components/table";
import { toast } from "react-toastify";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { Product } from "../../../models";

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

    const products = await Product.findAll();

    return {
        props: { productsRaw: JSON.stringify(products) }
    }
}

function PageProduct({ productsRaw }: { productsRaw: string }) {
    const [products, setProducts] = useState<IProduct[]>(JSON.parse(productsRaw));
    const handleRemove = useMemo(() => async (id: number | string) => 
        {
            if(!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
            const {data} = await instance.delete(`/products/${id}`);
            if(data.success){
                setProducts(products.filter(product => product.id !== id));
                toast.success("Xóa sản phẩm thành công");
            }else if(data.message){
                toast.error(data.message);
            }else {
                toast.error("Xóa sản phẩm thất bại");
            }
        },
    [products]);

    const columnHelper = useMemo(() => createColumnHelper<IProduct>(), []);

    const columns = useMemo(
        () => [
            {
                id: "index",
                header: "STT",
                cell: ({ row }) => row.index + 1,
            },
            columnHelper.accessor("name", {
                header: "Tên sản phẩm",
                cell: ({ row }) => <Link className='text-blue-500' href={`/product/${row.original.id}`}>{row.original.name}</Link>,
            }),
            columnHelper.accessor("target", {
                header: "Mục tiêu / ca",
            }),
            columnHelper.accessor("key_QR", {
                header: "Mã QR",
            }),
            columnHelper.accessor("pac", {
                header: "PAC",
            }),
            columnHelper.accessor("box", {
                header: "Box",
            }),
            columnHelper.accessor("note", {
                header: "Ghi chú",
                cell: ({ row }) => <p className="whitespace-break-spaces">{JSON.parse(row.original.note)?.join(", ")}</p>,
            }),
            {
                id: "action",
                header: "Hành động",
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Link href={`/product/${row.original.id}`} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center">Sửa</Link>
                        <button onClick={() => handleRemove(row.original.id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg px-5 py-2.5 text-center ml-2">Xóa</button>
                    </div>
                ),
            }
        ] as Array<ColumnDef<IProduct, unknown>>, [columnHelper, handleRemove]
      );
    
    return (
    <>
        <h1 className="text-center text-5xl font-bold mb-12">Danh sách sản phẩm</h1>
        <Link href="/product/new" className="text-white bg-blue-700 hover:bg-blue-800 block w-fit mb-2 ml-auto focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center">Thêm sản phẩm</Link>
        <Table columns={columns} data={products} />
    </>
    );
}

export default PageProduct;