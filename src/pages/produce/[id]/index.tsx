import ILine from "@/interfaces/line";
import { Line, LineWorker, Product, User } from "../../../../models";
import instance from "@/instance";
import IProduct from "@/interfaces/product";
import IUser from "@/interfaces/user";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import moment from "moment";

const Select = dynamic(() => import('react-select'), { ssr: false });

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

    if(session.user.role !== "worker") {
        return {
            redirect: {
                destination: '/404',
                permanent: false,
            }
        }
      }


    const user = await LineWorker.findOne({
        where: {
            worker_id: session.user.id
        }
    });

    if(user) {
        return {
            redirect: {
                destination: `/produce/${user.line_id}/start`,
                permanent: false,
            }
        }
    }

    const currentAssemblyLine = await Line.findOne({
        where: {
            id: context.params?.id
        }
    });

    if(currentAssemblyLine?.status === "ON") {
        return {
            redirect: {
                destination: `/produce/${context.params?.id}/start`,
                permanent: false,
            }
        }
    }

    const products = await Product.findAll();
    const workers = await User.findAll({
        where: {
            role: "worker",
        }
    });

    return {
        props: {
            productsRaw: JSON.stringify(products),
            workersRaw: JSON.stringify(workers)
        }
    }
  }

function PageProductDetail({ productsRaw, workersRaw }: { productsRaw: string, workersRaw: string }) {
    const router = useRouter();
    const { id } = router.query;
    const [currentAssemblyLine, setCurrentAssemblyLine] = useState<ILine>();
    const [assemblyLines, setAssemblyLines] = useState<ILine[]>([]);
    const products = useMemo<IProduct[]>(() => JSON.parse(productsRaw), [productsRaw]);
    const workers = useMemo<IUser[]>(() => JSON.parse(workersRaw), [workersRaw]);
    const shifts = useMemo<ILine['shift'][]>(() => [ "MS","NS","AS","ALL" ], []);
    const { register, handleSubmit, formState: { errors }, watch, control, setValue } = useForm<ILine>();
    const session = useSession();

    const onSubmit = async (data: ILine) => {
        data.finish = currentAssemblyLine!.finish || 0;
        data.status = "ON";
        data.manager_id = session.data!.user.id;
        data.name = assemblyLines.find(assemblyLine => assemblyLine.id === data.id)?.name || "";
        data.startAt = moment().local().format("YYYY-MM-DD HH:mm:ss");

        await instance.put<ILine>(`/lines/${id}`, data);
        toast.success("Cập nhật dây chuyền thành công");
        router.push(`/produce/${id}/start`);
    }

    useEffect(() => {
        (async () => {
            const { data: { data } } = await instance.get("/lines?status=OFF");
            setAssemblyLines(data);
            if(data.length === 0) return;
            if(!id) {
                const { data: { data: assemblyLineData } } = await instance.get(`/lines/${data[0].id}`);
                setCurrentAssemblyLine(assemblyLineData);
            }else{
                const { data: { data: assemblyLineData } } = await instance.get(`/lines/${id}`);
                setCurrentAssemblyLine(assemblyLineData);
            }
        })();
    }, [id]);

    useEffect(() => {
        if (currentAssemblyLine) {
            setValue('id', currentAssemblyLine.id);
        }
    }, [currentAssemblyLine, router, setValue]);

    return products.length > 0 && currentAssemblyLine &&(
        <>
            <div className="max-w-3xl mx-auto flex items-center justify-center">
                <div className="bg-white shadow-md border border-gray-200 w-full rounded-lg sm:p-6 lg:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" action="#">
                        <h3 className="text-4xl font-medium text-gray-900 text-center">Chi tiết dây chuyền</h3>
                        <div>
                            <label htmlFor="name" className=" font-medium block mb-2">Tên dây chuyền</label>
                            <Controller
                                control={control}
                                name="id"
                                render={({ field: { onChange, value, name } }) => (
                                    <Select
                                        // isDisabled={currentAssemblyLine.status === "ON"}
                                        name={name}
                                        placeholder="Chọn dây chuyền"
                                        noOptionsMessage={() => "Không có dây chuyền nào"}
                                        options={ assemblyLines }
                                        getOptionValue={(option) => (option as ILine).id.toString()}
                                        getOptionLabel={(option) => (option as ILine).name}
                                        value={ assemblyLines.find(assemblyLine => assemblyLine.id === value) } 
                                        onChange={(newValue) => {onChange((newValue as ILine)?.id); setCurrentAssemblyLine(newValue as ILine)}}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor="product" className=" font-medium block mb-2">Sản phẩm</label>
                            <Controller
                                control={control}
                                name="product_id"
                                rules={{ required: 'Trường này không được để trống' }}
                                render={({ field: { onChange, value, name } }) => (
                                    <Select
                                        // isDisabled={currentAssemblyLine.status === "ON"}
                                        name={name}
                                        placeholder="Chọn sản phẩm"
                                        noOptionsMessage={() => "Không có sản phẩm nào"}
                                        options={ products }
                                        getOptionValue={(option) => (option as IProduct).id.toString()}
                                        getOptionLabel={(option) => (option as IProduct).name}
                                        value={products.find(product => product.id === value)}
                                        onChange={(newValue) => onChange((newValue as IProduct)?.id)}
                                    />
                                )}
                            />
                            {errors.product_id && <span className="text-red-500  mt-2">{errors.product_id.message}</span>}
                        </div>
                        <div>
                            <label htmlFor="start" className=" font-medium block mb-2">Shift</label>
                            <select {...register('shift')} className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5">
                                {
                                    shifts.map((shift, index) => (
                                        <option key={index} value={shift}>{shift}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div>
                            <p className=" font-medium block mb-2">Mục tiêu sản phẩm</p>
                            <p className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5">{products.filter(product => product.id === watch('product_id'))[0]?.target || 0}</p>
                        </div>
                        <div>
                            <label className=" font-medium block mb-2">Nhân viên</label>
                            <Controller
                                control={control}
                                name="workerId"
                                rules={{ required: 'Trường này không được để trống' }}
                                render={({ field: { onChange, value, name } }) => (
                                    <Select
                                        name={name}
                                        placeholder="Chọn nhân viên"
                                        noOptionsMessage={() => "Không có nhân viên nào"}
                                        isMulti
                                        options={ workers }
                                        getOptionValue={(option) => (option as IUser).id.toString()}
                                        getOptionLabel={(option) => (option as IUser).name}
                                        value={workers.filter(worker => (value as number[])?.includes(Number(worker.id)))}
                                        onChange={(newValue) => onChange((newValue as IUser[])?.map(value => value.id) || [])}
                                    />
                                )}
                            />
                            {errors.workerId && <span className="text-red-500  mt-2">{errors.workerId.message}</span>}
                        </div>
                        {
                            currentAssemblyLine.status === "CANCELED" ? (
                                <button type="button" onClick={() => router.push('/')} className="text-white w-full bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Quay lại</button>
                            ) : (
                                <div className="flex space-x-6">
                                    <button type="button" onClick={() => router.push('/')} className="w-1/2 text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Quay lại</button>
                                    <button type="submit" className="w-1/2 text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Bắt đầu</button>
                                </div>
                            )
                        }
                    </form>
                </div>
            </div>
        </>
    );
}

export default PageProductDetail;