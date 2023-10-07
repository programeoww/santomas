import { NextApiRequest, NextApiResponse } from "next";
import {Product} from "../../../../models";
export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method === 'PUT'){
        req.body.note = JSON.stringify(req.body.note)
        const product = await Product.update(req.body, {
            where: {
                id: req.query.id
            }
        })

        res.status(200).json({
            message: "Cập nhật sản phẩm thành công!",
            success: true,
            data: product
        })
    } else if(req.method === 'DELETE'){
        const product = await Product.findOne({
            where: {
                id: req.query.id
            },
            include: [
                {
                    association: 'line_production'
                },
                {
                    association: 'lines'
                }
            ]
        })

        if(!product){
            return res.status(200).json({
                message: "Không tìm thấy sản phẩm!",
                success: false,
                data: null
            })
        }

        if(product.getDataValue('line_production')!.length > 0 || product.getDataValue('lines')!.length > 0){
            return res.status(200).json({
                message: "Không thể xóa sản phẩm này!",
                success: false,
                data: null
            })
        }

        await Product.destroy({
            where: {
                id: req.query.id
            }
        })

        res.status(200).json({
            message: "Xóa sản phẩm thành công!",
            success: true,
        })
    }
    res.status(200).json({message: "Hello World!"})
}