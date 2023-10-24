import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useMemo } from "react";
import IUser from "../../interfaces/user";
import { User } from "../../../models";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import instance from "@/instance";
import { useRouter } from "next/router";

type IUserEditForm = IUser & {
    id?: number | string,
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

    const users = await User.findOne({
        where: {
            id: context.params?.id,
        }
    })

    users?.setDataValue('password', '');

    return {
        props: { usersRaw: JSON.stringify(users) }
    }
}

function PageUserEdit({ usersRaw }: { usersRaw: string }) {
    const router = useRouter();
    const user = useMemo(() => JSON.parse(usersRaw), [usersRaw]);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<IUserEditForm>({
        defaultValues: user
    });
    const { id } = router.query;

    const onSubmit = async (data: IUserEditForm) => {
        if(!window.confirm("Bạn có chắc chắn muốn sửa người dùng này?")) return;

        const uploadData = { ...data } as Partial<IUserEditForm>;

        if(data.password === '') {
            delete uploadData.password;
        }
        const { data:resData } = await instance.put(`/users/${id}`, uploadData);

        if(resData.success) {
            toast.success("Sửa người dùng thành công");
            router.push(`/user`);
        }else{
            toast.error("Sửa người dùng thất bại");
        }
    }

    return user && (
        <div className="max-w-3xl mx-auto flex items-center justify-center">
            <div className="bg-white shadow-md border border-gray-200 w-full rounded-lg sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" action="#">
                    <h3 className="text-4xl font-medium text-gray-900 text-center">Sửa người dùng</h3>
                    <div>
                        <label htmlFor="name" className="font-medium block mb-2">Tên người dùng <span className="text-red-500">*</span></label>
                        <input {...register('name', {required: 'Trường này không được để trống'})} placeholder="NGUYEN VAN A" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.name && <span className="text-red-500  mt-2">{errors.name.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="username" className="font-medium block mb-2">Mã nhân viên <span className="text-red-500">*</span></label>
                        <input {...register('username', {required: 'Trường này không được để trống', pattern: {value: /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/gm, message: 'Mã nhân viên không hợp lệ'}})} placeholder="" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.username && <span className="text-red-500  mt-2">{errors.username.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="password" className="font-medium block mb-2">Mật khẩu</label>
                        <input {...register('password', {minLength: {value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự'}})} placeholder="********" type="password" className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.password && <span className="text-red-500  mt-2">{errors.password.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="role" className="font-medium block mb-2">Vai trò <span className="text-red-500">*</span></label>
                        <select {...register('role', {required: 'Trường này không được để trống'})} className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5">
                            <option value="admin">Admin</option>
                            <option value="worker">Worker</option>
                            <option value="manager">Giám sát Online</option>
                            <option value="tivi">Tivi</option>
                        </select>
                        {errors.role && <span className="text-red-500  mt-2">{errors.role.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="note" className="font-medium block mb-2">Note</label>
                        <input {...register('note')} className="bg-gray-50 border border-gray-300 sm: rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.note && <span className="text-red-500  mt-2">{errors.note.message}</span>}
                    </div>
                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg  px-5 py-2.5 text-center">Sửa người dùng</button>
                </form>
            </div>
        </div>
    )
}

export default PageUserEdit;