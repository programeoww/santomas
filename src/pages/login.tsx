import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getSession, signIn } from "next-auth/react";
import { GetServerSidePropsContext } from "next";

type Inputs = {
    username: string,
    password: string,
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const session = await getSession(context)
    if(session) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }
    return {
        props: {}
    }
}

function PageLogin() {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();

    const onSubmit = async ({ username, password }: Inputs) => {
        try {
            const res = await signIn('credentials', {username: username, password: password, callbackUrl: '/', redirect: false});
            if(res?.status === 200){
                toast.success("Đăng nhập thành công")
                window.location.href = '/'
            }
            else toast.error("Sai email hoặc mật khẩu")
        } catch (error) {
            toast.error("Sai email hoặc mật khẩu")
        }
    }

    return (
        <div className="max-w-2xl mx-auto min-h-screen flex items-center justify-center">
            <div className="bg-white shadow-md border border-gray-200 w-full rounded-lg max-w-sm p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" action="#">
                    <h3 className="text-xl font-medium text-gray-900 text-center">Đăng nhập</h3>
                    <div>
                        <label htmlFor="username" className="text-sm font-medium block mb-2">Mã nhân viên</label>
                        <input {...register('username', {required: "Trường này là bắt buộc", pattern: { value: /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/gm, message: "Mã nhân viên không đúng định dạng" }})} type="text" name="username" className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" placeholder="example" />
                        {errors.username && <span className="text-red-500 text-sm mt-2">{errors.username.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium block mb-2">Mật khẩu</label>
                        <input {...register('password', {required: true})} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-blue-500 block w-full p-2.5" />
                        {errors.password && <span className="text-red-500 text-sm mt-2">Trường này là bắt buộc</span>}
                    </div>
                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Đăng nhập</button>
                </form>
            </div>
        </div>

    );
}

export default PageLogin;