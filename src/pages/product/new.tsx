import { Controller, useForm } from "react-hook-form";
import IProduct from "@/interfaces/product";
import instance from "@/instance"; 
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";

const CreatableSelect = dynamic(import("react-select/creatable"), { ssr: false });

type IProductNewForm = IProduct & {
    id?: number | string
    note: string[]
}

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

    return {
        props: {}
    }
}

function PageProductNew() {
    const { register, handleSubmit, formState: { errors }, control } = useForm<IProductNewForm>();
    const router = useRouter()

    const onSubmit = async (data: IProductNewForm) => {
        await instance.post<IProduct>("/products", data);
        toast.success("Thêm sản phẩm thành công");
        router.push(`/product`);
    }

    return (
        <div className="max-w-3xl mx-auto flex items-center justify-center">
            <div className="bg-white shadow-md border border-gray-200 w-full rounded-lg sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" action="#">
                    <h3 className="text-4xl font-medium text-gray-900 text-center">Thêm sản phẩm</h3>
                    <div>
                        <label htmlFor="name" className="font-medium block mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
                        <input {...register('name', {required: 'Trường này không được để trống'})} placeholder="Sản phẩm 1" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.name && <span className="text-red-500  mt-2">{errors.name.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="target" className="font-medium block mb-2">Mục tiêu sản phẩm <span className="text-red-500">*</span></label>
                        <input {...register('target', {required: 'Trường này không được để trống'})} placeholder="1000" type="number" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.target && <span className="text-red-500  mt-2">{errors.target.message}</span>}
                    </div>
                    <div>
                        <label className="font-medium block mb-2">Mã QR <span className="text-red-500">*</span></label>
                        <input {...register('key_QR', {required: 'Trường này không được để trống'})} placeholder="123456789" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.key_QR && <span className="text-red-500  mt-2">{errors.key_QR.message}</span>}
                    </div>
                    <div>
                        <label className="font-medium block mb-2">PAC <span className="text-red-500">*</span></label>
                        <input {...register('pac', {required: 'Trường này không được để trống'})} placeholder="123" type="number" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.pac && <span className="text-red-500  mt-2">{errors.pac.message}</span>}
                    </div>
                    <div>
                        <label className="font-medium block mb-2">Box <span className="text-red-500">*</span></label>
                        <input {...register('box', {required: 'Trường này không được để trống'})} placeholder="123" type="number" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.box && <span className="text-red-500  mt-2">{errors.box.message}</span>}
                    </div>
                    <div>
                    <label className="font-medium block mb-2">Note</label>
                            <Controller
                                control={control}
                                name="note"
                                render={({ field: { onChange, value, name } }) => (
                                    <CreatableSelect 
                                        isClearable
                                        name={name}
                                        placeholder="Ghi chú"
                                        noOptionsMessage={() => "Không có ghi chú nào"}
                                        isMulti
                                        value={ value?.map((item: string) => ({ value: item, label: item })) }
                                        onChange={(newValue: unknown) => onChange((newValue as { value: string, label: string }[]).map((item) => item.value))}
                                    />
                                )}
                            />
                            {errors.note && <span className="text-red-500  mt-2">{errors.note.message}</span>}
                    </div>
                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Thêm sản phẩm</button>
                </form>
            </div>
        </div>
    )
}

export default PageProductNew;