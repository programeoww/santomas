import ILine from "@/interfaces/line";
import { useState, useEffect } from "react";
import IUser from "../../../interfaces/user";
import IProduct from "../../../interfaces/product";
import moment from "moment";
import { toast } from "react-toastify";
import ProduceDialog from "@/components/produceDialog";
import getFinishPercent from "../../../utils/getFinishPercent";
import { Controller, useForm, useWatch } from "react-hook-form";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import instance from "@/instance";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { Line, LineWorker } from "../../../../models";
import { useGlobalContext } from "@/pages/_app";

const CreatableSelect = dynamic(() => import('react-select/creatable'), { ssr: false });
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

    if(user && context.params?.id != user.line_id.toString()) {
        return {
            redirect: {
                destination: `/produce/${user.line_id}/start`,
                permanent: false,
            }
        }
    }

    const assembly_line = await Line.findOne({
        where: {
            id: Number(context.params?.id),
        },
    });

    if(assembly_line?.getDataValue('product_id') === null || !assembly_line?.getDataValue('product_id')) {
        return {
            redirect: {
                destination: `/produce/${assembly_line?.getDataValue('id') || ''}`,
                permanent: false,
            }
        }
    }

    if(assembly_line?.getDataValue("status") === "OFF") {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }
  
    return {
        props: {
        }
    }
  }

function PageProduce() {
    const router = useRouter()
    const { id } = router.query;
    const [currentAssemblyLine, setCurrentAssemblyLine] = useState<ILineWithRelationship>();
    // const [assemblyLines, setAssemblyLines] = useState<ILineWithRelationship[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { control, setValue } = useForm<ILine>();
    const { data: session } = useSession();
    // const watcher = useWatch({
    //     control,
    //     name: "note",
    // });
    const { setIsWorking, setCurrentLine, isWorking } = useGlobalContext()

    // useEffect(() => {
    //     (async () => {
    //         if(currentAssemblyLine) {
    //             const data = {
    //                 ...currentAssemblyLine,
    //             }
    
    //             const uploadData = { ...data } as Partial<ILineWithRelationship>
                
    //             delete uploadData.product;
    //             delete uploadData.workers;
    
    //             await instance.put<ILineWithRelationship>(`/lines/${data.id}`, uploadData);
    //         }
    //     })()

    // }, [currentAssemblyLine]);

    useEffect(() => {
        (async () => {
            if(!id) return;
            const assembly_line = id;
            const { data: { data: assemblyLinesData } } = await instance.get(`/lines/${assembly_line}`);
            setCurrentAssemblyLine(assemblyLinesData);
            setValue('note', assemblyLinesData.note);
            setCurrentLine(assemblyLinesData)

            // const { data: { data: assemblyLinesData } } = await instance.get(`/lines`);
            // setAssemblyLines(assemblyLinesData);
            // if(assembly_line) {
            //     setCurrentAssemblyLine(assemblyLinesData.find((assemblyLine: ILineWithRelationship) => assemblyLine.id === Number(assembly_line)));
            //     setValue('note', assemblyLinesData.find((assemblyLine: ILineWithRelationship) => assemblyLine.id === Number(assembly_line))?.note);
            //     setCurrentLine(assemblyLinesData.find((assemblyLine: ILineWithRelationship) => assemblyLine.id === Number(assembly_line)))
            // }else{
            //     setCurrentAssemblyLine(assemblyLinesData[0]);
            //     setValue('note', assemblyLinesData[0].note);
            //     setCurrentLine(assemblyLinesData[0])
            // }
        })();
        setIsWorking(true);
    }, [id, setValue, setIsWorking, setCurrentLine]);

    const updateAssemblyLine = async (quantity: number, is_manual = false) => {
        const data = {
            ...currentAssemblyLine,
            finish: is_manual ? quantity : Number(currentAssemblyLine?.finish) + quantity,
        }

        const uploadData = { ...data }

        delete uploadData.product;
        delete uploadData.user;

        await instance.put<ILineWithRelationship>(`/lines/${data.id}`, uploadData);
        setIsOpen(false);
        setCurrentAssemblyLine((data as ILineWithRelationship));
    }

    const updateNote = async (note: string[]) => {
        const data = {
            ...currentAssemblyLine,
            note: note,
        }

        const uploadData = { ...data }

        delete uploadData.product;
        delete uploadData.user;

        await instance.put<ILineWithRelationship>(`/lines/${data.id}`, uploadData);
        setIsOpen(false);
        setCurrentAssemblyLine((data as ILineWithRelationship));
        setValue('note', note);
    }

    const endAssemblyLine = async () => {
        if(!isWorking) return;
        if(confirm("Bạn có chắc chắn muốn kết thúc dây chuyền này?")) {
            const data = {
                ...currentAssemblyLine,
                endAt: moment().local().toISOString(true),
                status: "OFF",
                is_end: true,
                finish: Number(currentAssemblyLine?.finish),
                manager_id: session?.user.id
            }
    
            const uploadData = { ...data }
    
            delete uploadData.product;
            delete uploadData.user;
    
            await instance.put<ILineWithRelationship>(`/lines/${data.id}`, uploadData);
            setCurrentLine(undefined)
            setIsWorking(false);
            toast.success("Kết thúc dây chuyền thành công");
            router.push('/');
        }
    }

    return currentAssemblyLine && (
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
                        options={ [currentAssemblyLine] }
                        getOptionValue={(option) => (option as ILineWithRelationship).id.toString()}
                        getOptionLabel={(option) => (option as ILineWithRelationship).name}
                        value={[currentAssemblyLine].find(assemblyLine => assemblyLine?.id === currentAssemblyLine?.id)}
                        onChange={(newValue) => currentAssemblyLine?.id !== (newValue as ILineWithRelationship).id && router.push(`/produce/${(newValue as ILineWithRelationship).id}`)}
                    />
                </div>
                <div className="p-5 w-1/3">
                    <div className="flex items-center border border-neutral-300 rounded p-2 px-4 space-x-3">
                        <p className="text-xl text-center leading-8">Sản phẩm:</p>
                        <p className="text-2xl font-medium text-center">{currentAssemblyLine?.product.name}</p>
                    </div>
                </div>
                <div className="p-5 w-1/3">
                    <div className="flex items-center border border-neutral-300 rounded p-2 px-4 space-x-3">
                        <p className="text-xl text-center leading-8">Shift:</p>
                        <p className="text-2xl font-medium text-center">{currentAssemblyLine?.shift}</p>
                    </div>
                </div>
                <div className="w-full p-5">
                    <div className="p-2 rounded px-4 border border-neutral-300">
                        <p className="text-xl mb-2 font-medium">Ghi chú</p>
                        <Controller
                            control={control}
                            name="note"
                            render={({ field: { value, name } }) => (
                                <CreatableSelect
                                    formatCreateLabel={(inputValue) => `Thêm ghi chú "${inputValue}"`}
                                    isClearable
                                    name={name}
                                    placeholder="Ghi chú"
                                    noOptionsMessage={() => "Không có ghi chú nào"}
                                    isMulti
                                    options={ JSON.parse(currentAssemblyLine?.product.note || '[]')?.map((item: string) => ({ value: item, label: item })) }
                                    value={ value?.map((item : string) => ({ value: item, label: item })) }
                                    onChange={(newValue) => updateNote((newValue as { value: string, label: string }[]).map((item) => item.value))}
                                />
                            )}
                        />
                    </div>
                </div>
                <div className="p-5 w-2/3">
                    <div className="flex items-center rounded p-2 space-x-10">
                        <p className="text-xl leading-8 w-1/2">Mục tiêu sản lượng:</p>
                        <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{currentAssemblyLine?.product.target}</p>
                    </div>
                    <div className="flex items-center rounded p-2 space-x-10">
                        <p className="text-xl leading-8 w-1/2">Số lượng hiện tại:</p>
                        <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{currentAssemblyLine?.finish}</p>
                    </div>
                    <div className="flex items-center rounded p-2 space-x-10">
                        <p className="text-xl leading-8 w-1/2">Tỷ lệ hoàn thành</p>
                        <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{getFinishPercent(currentAssemblyLine?.finish, currentAssemblyLine?.product.target)}%</p>
                    </div>
                    <div className="flex items-center rounded p-2 space-x-10">
                        <p className="text-xl leading-8 w-1/2">Số lượng còn thiếu:</p>
                        <p className="text-2xl text-center py-2 border border-neutral-300 rounded font-medium w-1/2">{Number(currentAssemblyLine?.product.target) - Number(currentAssemblyLine?.finish) < 0 ? 0 : Number(currentAssemblyLine?.product.target) - Number(currentAssemblyLine?.finish) || 0}</p>
                    </div>
                </div>
                <div className="p-5 w-1/3 flex flex-col justify-between uppercase">
                    <div className="p-2">
                        <button onClick={()=>updateAssemblyLine(1)} className="bg-blue-500 hover:bg-blue-600 duration-150 text-white rounded px-4 py-2.5 text-xl font-medium w-full">+1 PCS</button>
                    </div>
                    <div className="p-2">
                        <button onClick={()=>updateAssemblyLine(Number(currentAssemblyLine?.product.pac))} className="bg-blue-500 hover:bg-blue-600 duration-150 text-white rounded px-4 py-2.5 text-xl font-medium w-full">+ PAC</button>
                    </div>
                    <div className="p-2">
                        <button onClick={()=>updateAssemblyLine(Number(currentAssemblyLine?.product.box))} className="bg-blue-500 hover:bg-blue-600 duration-150 text-white rounded px-4 py-2.5 text-xl font-medium w-full">+ BOX</button>
                    </div>
                    <div className="p-2">
                        <button onClick={()=>setIsOpen(true)} className="bg-blue-500 hover:bg-blue-600 duration-150 text-white rounded px-4 py-2.5 text-xl font-medium w-full">Nhập tay</button>
                    </div>
                </div>
                <div className="p-5 w-full">
                    <div className="flex justify-center space-x-5">
                        <button onClick={endAssemblyLine} className="bg-red-500 w-1/4 hover:bg-red-600 duration-150 text-white rounded px-4 py-2.5 text-xl font-medium">Kết thúc dây chuyền</button>
                    </div>
                </div>
            </div>
            <ProduceDialog isOpen={isOpen} setIsOpen={setIsOpen} handleUpdate={updateAssemblyLine} />
        </div>
    );
}

export default PageProduce;