import {Line} from "../../../../models";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method === 'POST'){
        try {
            const AssemblyLine = await Line.create(req.body)
            res.status(200).json({
                message: "Tạo dây chuyền thành công!",
                success: true,
                data: AssemblyLine
            })
        } catch (error) {
            res.status(200).json({
                message: "Tạo dây chuyền thất bại!",
                success: false,
                data: error
            })
        }
    } else if(req.method === 'GET'){
        try{
            const filter : {
                status?: string
            } = {}

            if(req.query.status && req.query.status !== ''){
                filter.status = req.query.status.toString()
            }

            const AssemblyLine = await Line.findAll({
                include: [
                    {
                        association: 'manager'
                    },
                    {
                        association: 'workers'
                    },
                    {
                        association: 'product'
                    },
                ],
                where: {
                    ...filter
                }
            })

            const data = AssemblyLine.map((item: any) => {
                const data = item.dataValues;
                data.note = JSON.parse(data.note === "" ? "[]" : data.note)
                return data;
            });

            res.status(200).json({
                message: "Lấy dây chuyền thành công!",
                success: true,
                data: data
            })
        } catch (error) {
            console.log(error);
            
            res.status(200).json({
                message: "Lấy dây chuyền thất bại!",
                success: false,
                data: error
            })
        }
    }
    res.status(200).json({message: "Hello World!"})
}
