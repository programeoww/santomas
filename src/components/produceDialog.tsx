import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useState } from "react";

function ProduceDialog({ isOpen, setIsOpen, handleUpdate }: { isOpen: boolean; setIsOpen: (value: boolean) => void, handleUpdate: (quantity: number, is_manual: boolean) => void }) {
    const [quantity, setQuantity] = useState<number>(0);

    return (
        <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)}>
            <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            >
            <div className="fixed inset-0 bg-black/30" />
            </Transition.Child>

            <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            >
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-sm rounded bg-white p-5">
                    <Dialog.Title className={`text-xl font-medium`}>Nhập sản lượng muốn thêm</Dialog.Title>
                    <input onInput={(e)=>setQuantity(Number(e.currentTarget.value))} type="number" className="border border-gray-300 rounded-lg w-full p-2.5 mt-2" />
                    <div className="flex justify-center mt-5">
                        <button onClick={()=>setIsOpen(false)} className="bg-gray-500 hover:bg-gray-600 duration-150 text-white rounded px-4 py-2.5 font-medium">Hủy</button>
                        <button onClick={()=>handleUpdate(quantity, true)} className="bg-blue-500 hover:bg-blue-600 duration-150 text-white rounded px-4 py-2.5 font-medium ml-3">Xác nhận</button>
                    </div>
                </Dialog.Panel>
            </div>
            </Transition.Child>
        </Dialog>
        </Transition>
  );
}

export default ProduceDialog;
