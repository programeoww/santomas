import ILine from "@/interfaces/line";
import { useState, useEffect, useRef } from "react";
import IUser from "../interfaces/user";
import IProduct from "../interfaces/product";
import { CircularProgressbar } from "react-circular-progressbar";
import moment from "moment";
import getFinishPercent from "../utils/getFinishPercent";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import instance from "@/instance";
import { getSession, useSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import 'react-circular-progressbar/dist/styles.css';

const Select = dynamic(() => import('react-select'), { ssr: false });

type ILineWithRelationship = ILine & {
    product: IProduct;
    user: IUser;
    workerId: number[];
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

    if(session.user.role !== "admin" && session.user.role !== "tivi") {
        return {
            redirect: {
                destination: '/404',
                permanent: false,
            }
        }
      }

    if(session.user.role === "tivi") {
        const initLine = session.user.username.split('-').slice(1).join(' ');
        if(context.query.assembly_line !== initLine) {
            return {
                props: {
                    defaultLine: initLine
                }
            }
        }
    }
  
    return {
        props: {
        }
    }
  }

function PageInspection({ defaultLine }: { defaultLine: string }) {
    const [currentAssemblyLine, setCurrentAssemblyLine] = useState<ILineWithRelationship>();
    const [assemblyLines, setAssemblyLines] = useState<ILineWithRelationship[]>([]);
    const [currentTime, setCurrentTime] = useState<string>();
    const [noData, setNoData] = useState<boolean>(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(moment().format("HH:mm:ss DD-MM-YYYY"));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        (async () => {
            const { data: { data: assemblyLinesData } } = await instance.get(`/lines`);
            setAssemblyLines(assemblyLinesData);
            if(defaultLine){
                const defaultLineExist = assemblyLinesData.find((assemblyLine: ILineWithRelationship) => {
                    return assemblyLine.name === defaultLine
                })
                if(defaultLine && defaultLineExist) {
                    setCurrentAssemblyLine(defaultLineExist);
                }else if(!defaultLineExist && assemblyLinesData.length > 0) {
                    setNoData(true);
                }
            }else{
                setCurrentAssemblyLine(assemblyLinesData[0]);
            }

            if(assemblyLinesData.length === 0) {
                setNoData(true);
            }
        })();
    }, [defaultLine]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if(currentAssemblyLine && currentAssemblyLine.status === "ON") {
                const { data: { data: assemblyLineData } } = await instance.get(`/lines/${currentAssemblyLine.id}`);
                setCurrentAssemblyLine(assemblyLineData);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [currentAssemblyLine]);

    const session = useSession()

    if(currentTime && currentAssemblyLine){
        return (
            <div className="shadow-lg p-8 border max-w-7xl mx-auto">
                <h1 className="text-center text-4xl font-bold mb-12">Bảng hiện thị số lượng sản phẩm lắp ráp</h1>
                <div className="flex flex-wrap -m-5 items-stretch">
                    <div className="p-5 w-1/3">
                        <Select
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    minHeight: 50,
                                }),
                            }}
                            defaultValue={currentAssemblyLine}
                            placeholder="Chọn dây chuyền"
                            noOptionsMessage={() => "Không có dây chuyền nào"}
                            options={ session.data?.user.role === 'admin' ? assemblyLines : [currentAssemblyLine] }
                            getOptionValue={(option) => (option as ILineWithRelationship).id.toString()}
                            getOptionLabel={(option) => (option as ILineWithRelationship).name}
                            value={assemblyLines.find(assemblyLine => assemblyLine.id === currentAssemblyLine.id)}
                            onChange={(newValue) => setCurrentAssemblyLine(newValue as ILineWithRelationship)}
                        />
                    </div>
                    <div className="p-5 w-1/3">
                        <div className="flex items-center border border-neutral-300 rounded p-2 px-4 space-x-3">
                            <p className="text-xl text-center leading-8">Sản phẩm:</p>
                            {
                                currentAssemblyLine.status === "OFF" ? (
                                    <p className="text-2xl font-medium text-center">Không có dữ liệu</p>
                                ) : (
                                    <p className="text-2xl font-medium text-center">{currentAssemblyLine.product?.name ?? "Không có dữ liệu"}</p>
                                )
                            }
                        </div>
                    </div>
                    <div className="p-5 w-1/3">
                        <div className="flex items-center border border-neutral-300 rounded p-2 px-4 space-x-3">
                            <p className="text-xl text-center leading-8">Shift:</p>
                            <p className="text-2xl font-medium text-center">{currentAssemblyLine.shift ?? "Không có dữ liệu"}</p>
                        </div>
                    </div>
                    <div className="w-full p-5">
                        <div className="p-2 rounded px-4 border border-neutral-300">
                            <p className="text-xl mb-2 font-medium">Note</p>
                            <p className="text-lg">{currentAssemblyLine.note?.join(", ")}</p>
                        </div>
                    </div>
                    {
                        currentAssemblyLine.status !== "ON" && <div className="p-5 w-full">
                            <p className="text-2xl font-semibold text-center text-red-500 uppercase">Line hiện đang OFF</p>
                        </div>
                    }
                    <div className="p-5 w-2/3">
                        <div className="flex items-center rounded p-2 space-x-10">
                            <p className="text-xl leading-8 w-1/2">Mục tiêu sản lượng:</p>
                            <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{currentAssemblyLine.product?.target ?? 0}</p>
                        </div>
                        <div className="flex items-center rounded p-2 space-x-10">
                            <p className="text-xl leading-8 w-1/2">Số lượng hiện tại:</p>
                            <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{currentAssemblyLine.status === "OFF" ? 0 : currentAssemblyLine.finish}</p>
                        </div>
                        <div className="flex items-center rounded p-2 space-x-10">
                            <p className="text-xl leading-8 w-1/2">Tỷ lệ hoàn thành</p>
                            <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{currentAssemblyLine.status === "OFF" ? 0 : getFinishPercent(currentAssemblyLine.finish, currentAssemblyLine.product?.target)}%</p>
                        </div>
                        <div className="flex items-center rounded p-2 space-x-10">
                            <p className="text-xl leading-8 w-1/2">Số lượng còn thiếu:</p>
                            <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{currentAssemblyLine.status === "OFF" ? currentAssemblyLine.product?.target ?? 0 : Number(currentAssemblyLine.product?.target) - Number(currentAssemblyLine.finish) < 0 ? 0 : Number(currentAssemblyLine.product?.target) - Number(currentAssemblyLine.finish) || 0}</p>
                        </div>
                    </div>
                    <div className="p-5 w-1/4 mx-auto">
                        <CircularProgressbar styles={{path:{stroke: `rgb(59, 130, 246)`}, text: {fill: 'rgb(59, 130, 246)'},}} className="duration-150" value={currentAssemblyLine.status === "OFF" ? 0 : Number(currentAssemblyLine.finish) * 100 / Number(currentAssemblyLine.product?.target)} text={`${currentAssemblyLine.status === "OFF" ? 0 : getFinishPercent(currentAssemblyLine.finish, currentAssemblyLine.product?.target)}%`} />
                    </div>
                    <div className="p-5 w-1/2 border-t-2">
                        <div className="flex items-center rounded p-2">
                            {
                                currentAssemblyLine.status !== "OFF" && (
                                    <>
                                        <p className="text-xl leading-8 w-1/2">Thời gian bắt đầu:</p>
                                        <p className="text-2xl text-center py-2 px-3 border border-neutral-300 rounded font-medium w-1/2">{moment(currentAssemblyLine.startAt).format("HH:mm:ss DD-MM-YYYY")}</p>
                                    </>
                                )
                            }
                        </div>
                    </div>
                    <div className="p-5 w-1/2 border-t-2">
                        <div className="flex items-center rounded p-2">
                            <p className="text-xl leading-8 w-1/2">Thời gian hiện tại:</p>
                            <p className="text-2xl text-center py-2 px-3 border border-neutral-300 rounded font-medium w-1/2">{currentTime}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if(noData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-center text-4xl font-bold mb-12">Không có dữ liệu</h1>
            </div>
        )
    } else {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-neutral-300"></div>
            </div>
        )
    }
}

export default PageInspection;