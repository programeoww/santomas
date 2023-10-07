import instance from "@/instance"; 
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import moment from "moment";
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import ILine from "@/interfaces/line";

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
        props: { }
    }
}

function PageAssemblyLineNew() {
    const { register, handleSubmit, formState: { errors } } = useForm<ILine>();
    const router = useRouter();
    const session = useSession();

    const onSubmit = async (data: ILine) => {
        if(session.data && session.data.user){
            data.finish = 0;
            data.status = "OFF";
            data.startAt = moment().toISOString();
            data.manager_id = session.data.user.id

            await instance.post<ILine>("/lines", data);
            toast.success("Thêm dây chuyền thành công");
            router.push("/lines");
        }
    }

    return (
        <>
            <div className="max-w-3xl mx-auto flex items-center justify-center">
                <div className="bg-white shadow-md border border-gray-200 w-full rounded-lg sm:p-6 lg:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" action="#">
                        <h3 className="text-4xl font-medium text-gray-900 text-center">Thêm dây chuyền</h3>
                        <div>
                            <label htmlFor="name" className=" font-medium block mb-2">Tên dây chuyền <span className="text-red-500">*</span></label>
                            <input {...register('name', {required: 'Trường này không được để trống'})} placeholder="Dây chuyền 1" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                            {errors.name && <span className="text-red-500  mt-2">{errors.name.message}</span>}
                        </div>
                        <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Thêm</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default PageAssemblyLineNew;