import {Line, LineProduction} from "../../../../models";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method === 'GET'){
        try{
            const AssemblyLine = await LineProduction.findAll({
                include: [
                    {
                        association: "product"
                    },
                    {
                        association: "manager"
                    },
                    {
                      association: "line"
                    }
                ],
                order: [
                    ["createdAt", "DESC"]
                ]
            })

            res.status(200).json({
                message: "Lấy dây chuyền thành công!",
                success: true,
                data: AssemblyLine
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
