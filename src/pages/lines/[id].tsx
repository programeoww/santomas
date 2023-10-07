import IProduct from "../../interfaces/product";
import { useMemo } from "react";
import instance from "@/instance";
import ILine from "@/interfaces/line";
import { Controller, useForm } from "react-hook-form";
import { MultiValue, SingleValue } from 'react-select';
import IUser from "@/interfaces/user";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { GetServerSidePropsContext } from "next";
import { Line, Product, User } from "../../../models";
import { getSession, useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const Select = dynamic(() => import('react-select'), { ssr: false });

interface Params extends ParsedUrlQuery {
    id: string;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const { id } = context.params as Params;
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

    if(!id) {
        return {
            redirect: {
                destination: '/lines',
                permanent: false
            }
        }
    }

    const assemblyLines = await Line.findAll({
        where: {
            id: id
        },
    })

    return {
        props: { 
            assemblyLinesRaw: JSON.stringify(assemblyLines),
        }
    }
}

function PageAssemblyLineEdit({ assemblyLinesRaw }: { assemblyLinesRaw: string }) {
    const router = useRouter();
    const { id } = router.query as Params;
    const currentAssemblyLine = useMemo<ILine>(() => JSON.parse(assemblyLinesRaw)[0], [assemblyLinesRaw]);
    const { register, handleSubmit, formState: { errors } } = useForm<ILine>({
        defaultValues: {
            name: currentAssemblyLine.name,
        }
    });

    const onSubmit = async (data: ILine) => {
        await instance.put<ILine>(`/lines/${id}`, data);
        toast.success("Cập nhật dây chuyền thành công");
        router.push(`/lines`);
    }

    return (
        <>
            <div className="max-w-3xl mx-auto flex items-center justify-center">
                <div className="bg-white shadow-md border border-gray-200 w-full rounded-lg sm:p-6 lg:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" action="#">
                        <h3 className="text-4xl font-medium text-gray-900 text-center">Sửa dây chuyền</h3>
                        <div>
                            <label htmlFor="name" className=" font-medium block mb-2">Tên dây chuyền <span className="text-red-500">*</span></label>
                            <input {...register('name', {required: 'Trường này không được để trống'})} placeholder="Dây chuyền 1" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                            {errors.name && <span className="text-red-500  mt-2">{errors.name.message}</span>}
                        </div>
                        <div className="flex space-x-6">
                            <button type="button" onClick={() => router.push('/lines')} className="w-1/2 text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Quay lại</button>
                            <button type="submit" className="w-1/2 text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Lưu</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default PageAssemblyLineEdit;