import instance from "@/instance";
import { useGlobalContext } from "@/pages/_app";
import { Menu, Transition } from "@headlessui/react";
import moment from "moment";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fragment, useState } from "react";
import { List, PersonCircle } from "react-bootstrap-icons";
import "react-modern-drawer/dist/index.css";
const Drawer = dynamic(import("react-modern-drawer"), { ssr: false });

function Header() {
    const session = useSession();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { isWorking, currentLine } = useGlobalContext()

    const handleSignOut = async () => {
        if(isWorking) {
          if(confirm("Bạn có chắc chắn muốn kết thúc dây chuyền này?")) {
            const data = {
                ...currentLine,
                endAt: moment().local().toISOString(true),
                status: "OFF",
                is_end: true,
                finish: Number(currentLine?.finish),
            }
    
            const uploadData = { ...data }
            
            delete uploadData.product;
    
            await instance.put(`/lines/${data.id}`, uploadData);
            signOut()
          }
        }else{
          signOut()
        }
    }

    return session && session.data && session.data.user && (
        <header className="bg-blue-600 px-6 py-5 text-white flex items-center">
          <div className="space-x-5 flex items-center">
            <List className="text-2xl cursor-pointer" onClick={() => setIsDrawerOpen(!isDrawerOpen)} />
            <Link href="/"><h1 className="text-xl font-semibold">SANTOMAS Viet Nam</h1></Link>
            <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(!isDrawerOpen)} direction="left" className="text-neutral-800 text-lg" duration={250}>
              <ul className="py-5">
                {
                  (session.data.user.role === "tivi" || session.data.user.role === "admin" || session.data.user.role === "manager") && <li><Link onClick={()=>setIsDrawerOpen(false)} className={'px-5 py-2 block hover:bg-neutral-100 duration-150'} href="/inspection">Giám sát</Link></li>
                }
                {
                  session.data.user.role === "admin" &&
                  (
                    <>
                    <li><Link onClick={()=>setIsDrawerOpen(false)} className={'px-5 py-2 block hover:bg-neutral-100 duration-150'} href="/productivity">Báo cáo lắp ráp</Link></li>
                    <li><Link onClick={()=>setIsDrawerOpen(false)} className={'px-5 py-2 block hover:bg-neutral-100 duration-150'} href="/product">Sản phẩm</Link></li>
                    <li><Link onClick={()=>setIsDrawerOpen(false)} className={'px-5 py-2 block hover:bg-neutral-100 duration-150'} href="/user">Người dùng</Link></li>
                    <li><Link onClick={()=>setIsDrawerOpen(false)} className={'px-5 py-2 block hover:bg-neutral-100 duration-150'} href="/lines">Danh sách dây chuyền</Link></li>
                    </>
                   )
                } 
                { (session.data.user.role === "admin" || session.data.user.role === "manager") && <li><Link onClick={()=>setIsDrawerOpen(false)} className={'px-5 py-2 block hover:bg-neutral-100 duration-150'} href="/">Giám sát online</Link></li>}
              </ul>
            </Drawer>
          </div>
          <Menu as="div" className="relative ml-auto">
            <Menu.Button className="block">
              <PersonCircle className="text-2xl cursor-pointer" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    <button onClick={handleSignOut} className='hover:bg-blue-500 hover:text-white text-neutral-800 group flex w-full items-center rounded-md px-2 py-2 text-sm'>
                      Đăng xuất
                    </button>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </header>
    );
}

export default Header;