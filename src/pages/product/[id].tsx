import { Controller, useForm } from "react-hook-form";
import IProduct from "../../interfaces/product";
import instance from "@/instance"; 
import { toast } from "react-toastify";
import { useMemo } from "react";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Product } from "../../../models";
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

    const products = await Product.findOne({
        where: {
            id: context.params?.id
        },
    });

    products?.setDataValue('note', JSON.parse(products.getDataValue('note')));

    return {
        props: { productsRaw: JSON.stringify(products) }
    }
}

function PageProductEdit({ productsRaw }: { productsRaw: string }) {
    const router = useRouter();
    const { id } = router.query;
    const product = useMemo(() => JSON.parse(productsRaw), [productsRaw]);
    const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<IProductNewForm>({
        defaultValues: product
    });

    const onSubmit = async (data: IProductNewForm) => {
        await instance.put<IProduct>(`/products/${id}`, data);
        toast.success("Sửa sản phẩm thành công");
        router.push(`/product`);
    }

    return (
        <div className="max-w-3xl mx-auto flex items-center justify-center">
            <div className="bg-white shadow-md border border-gray-200 w-full rounded-lg sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" action="#">
                    <h3 className="text-4xl font-medium text-gray-900 text-center">Sửa sản phẩm</h3>
                    <div>
                        <label htmlFor="name" className="font-medium block mb-2">Tên sản phẩm <span className="text-red-500">*</span></label>
                        <input {...register('name', {required: 'Trường này không được để trống'})} placeholder="Sản phẩm 1" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.name && <span className="text-red-500  mt-2">{errors.name.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="cycle_time" className="font-medium block mb-2">Cycle time lắp ráp (s) <span className="text-red-500">*</span></label>
                        <input {...register('cycle_time', {required: 'Trường này không được để trống'})} placeholder="100" type="number" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.cycle_time && <span className="text-red-500  mt-2">{errors.cycle_time.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="target" className="font-medium block mb-2">Mục tiêu sản phẩm <span className="text-red-500">*</span></label>
                        <input {...register('target', {required: 'Trường này không được để trống'})} placeholder="1000" type="number" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.target && <span className="text-red-500  mt-2">{errors.target.message}</span>}
                    </div>
                    <div>
                        <label className="font-medium block mb-2">Mã QR <span className="text-red-500">*</span></label>
                        <input {...register('key_QR', {required: 'Trường này không được để trống'})} placeholder="123456789" type="text" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
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
                                        options={ product.note ? product.note.map((item: string) => ({ value: item, label: item })) : [] }
                                        value={ value?.map((item) => ({ value: item, label: item })) }
                                        onChange={(newValue: unknown) => onChange((newValue as { value: string, label: string }[]).map((item) => item.value))}
                                    />
                                )}
                            />
                            {errors.note && <span className="text-red-500  mt-2">{errors.note.message}</span>}
                    </div>
                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Sửa sản phẩm</button>
                </form>
            </div>
        </div>
    )
}

export default PageProductEdit;