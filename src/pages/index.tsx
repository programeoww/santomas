import {Line} from "../../models"
import {Product} from "../../models"
import {User} from "../../models"
import ILine from "@/interfaces/line"
import { GetServerSidePropsContext } from "next"
import { getSession } from "next-auth/react"
import Link from "next/link"
import { Op } from "sequelize"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import getStatusColor from "@/utils/getStatusColor"
import { useMemo } from "react"
import getFinishPercent from "@/utils/getFinishPercent"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context)
  if(!session || !session.user) {
      return {
          redirect: {
              destination: '/login',
              permanent: false
          }
      }
  }

  if(session.user.role !== "admin" && session.user.role !== "worker") {
    return {
        redirect: {
            destination: '/inspection',
            permanent: false,
        }
    }
  }else if(session.user.role === "worker") {
    return {
        redirect: {
            destination: '/produce',
            permanent: false,
        }
    }
  }

  const assemblyLines = await Line.findAll({
    where: {
        status: {
            [Op.or]: ["PENDING", "OFF"]
        }
    },
    include: [
      {
        model: User,
        as: "manager",
        foreignKey: "manager_id"
      },
      {
        model: Product,
        as: "product",
        foreignKey: "product_id"
      }
    ]
  })

  return {
      props: {
        assemblyLinesRaw: JSON.stringify(assemblyLines)
      }
  }
}

export default function Home({assemblyLinesRaw}: {assemblyLinesRaw: string}) {
  const assemblyLines = useMemo<ILine[]>(() => JSON.parse(assemblyLinesRaw), [assemblyLinesRaw]);

  // console.log(assemblyLines);

  return assemblyLines.length > 0 ? (
    <>
      <h1 className="text-center text-5xl font-bold mb-12">Giám sát online</h1>
      <div className="flex flex-wrap -m-5">
          {
              assemblyLines.map((assemblyLine, index) => (
                  <div className="p-5 w-1/4" key={index}>
                      <div className="bg-white h-full relative shadow-lg rounded-lg px-5 py-12 block hover:shadow-xl duration-150 border">
                          <Link href={`/produce/${assemblyLine.id}`} className="">
                              <div className="absolute top-4 left-0 -translate-x-3 text-xl bg-lime-600 text-white py-1.5 px-3 rounded">{assemblyLine.name}</div>
                              <div className="space-y-5 max-w-[250px] mx-auto">
                                  {
                                      assemblyLine.status === "ON" ? (
                                          <CircularProgressbar styles={{path:{stroke: `rgb(59, 130, 246)`}, text: {fill: 'rgb(59, 130, 246)'},}} className="duration-150" value={Number(assemblyLine.finish) * 100 / Number(assemblyLine.product?.target) || 0} text={getFinishPercent(assemblyLine.finish, assemblyLine.product?.target || 0) + "%"} />
                                      ):
                                      <CircularProgressbar styles={{path:{stroke: `rgb(59, 130, 246)`}, text: {fill: 'rgb(59, 130, 246)'},}} className="duration-150" value={0} text={"0%"} />
                                  }
                                  <p className="text-4xl font-bold text-center">{assemblyLine.finish} / {assemblyLine.product?.target || 0}</p>
                              </div>
                          </Link>
                          <div className="flex border-t-2 mt-5 pt-5 justify-between">
                              <div className="">
                                  <p className="text-2xl">Sản phẩm: <span className="font-bold">{assemblyLine.product?.name || "Chưa có sản phẩm"}</span></p>
                                  <p className="mt-2">Trạng thái: <span style={{color: getStatusColor(assemblyLine.status)}} className="font-bold">{assemblyLine.status}</span></p>
                              </div>
                              <div className="flex items-center space-x-3">
                              </div>
                          </div>
                      </div>
                  </div>
              ))
          }
      </div>
  </>
  ) : (
    <div className="flex items-center justify-center h-screen">
        <h1 className="text-center text-4xl font-bold mb-12">Không có dữ liệu</h1>
    </div>
  )
}
