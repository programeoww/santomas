import { NextApiRequest, NextApiResponse } from "next";
import { Line, LineProduction, LineWorker, Product as ProductModel } from "../../../../models";
import moment from "moment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'PUT'){
        if(req.body.is_end){
            const Product = await ProductModel.findByPk(req.body.product_id)

            if(!Product){
                return res.status(200).json({
                    message: "Không tìm thấy sản phẩm!",
                    success: false,
                    data: null
                })
            }

            const WorkerCount = await LineWorker.count({
                where: {
                    line_id: req.query.id
                }
            })

            const SavedLog = await LineProduction.create({
                line_id: Number(req.query.id),
                product_id: req.body.product_id,
                manager_id: req.body.manager_id,
                target: Number(Product.getDataValue('target')),
                shift: req.body.shift,
                start_time: moment(req.body.startAt).local().format('HH:mm:ss'),
                end_time: req.body.endAt,
                note: JSON.stringify(req.body.note),
                date: moment(req.body.endAt).toDate(),
                worker_count: WorkerCount,
                finish: req.body.finish
            })

            if(!SavedLog){
                return res.status(200).json({
                    message: "Lưu log thất bại!",
                    success: false,
                    data: null
                })
            }

            req.body.product_id = null
            req.body.shift = null
            req.body.finish = 0
            req.body.note = []

            //delete all worker
            await LineWorker.destroy({
                where: {
                    line_id: req.query.id
                }
            })
        }

        req.body.note = JSON.stringify(req.body.note)

        const AssemblyLine = await Line.update(req.body, {
            where: {
                id: req.query.id
            }
        })

        if(req.body.workerId && req.body.workerId.length > 0){
            Line.findByPk(req.query.id?.toString()).then((line: any) => {
                line.setWorkers(req.body.workerId)
            })
        }

        res.status(200).json({
            message: "Cập nhật dây chuyền thành công!",
            success: true,
            data: AssemblyLine
        })
    }else if(req.method === 'GET'){
        try{
            const AssemblyLine = await Line.findOne({
                where: {
                    id: req.query.id
                },
                include: [
                    {
                        association: 'manager'
                    },
                    {
                        association: 'workers'
                    },
                    {
                        association: 'product'
                    }
                ]
            })

            if(!AssemblyLine){
                return res.status(200).json({
                    message: "Không tìm thấy dây chuyền!",
                    success: false,
                    data: null
                })
            }

            const data = {
                ...AssemblyLine.dataValues,
                note: JSON.parse(AssemblyLine.dataValues.note === "" ? "[]" : AssemblyLine.dataValues.note)
            }

            res.status(200).json({
                message: "Lấy dây chuyền thành công!",
                success: true,
                data: data
            })
        } catch (error) {
            res.status(200).json({
                message: "Lấy dây chuyền thất bại!",
                success: false,
                data: error
            })
        }
    } else if(req.method === 'DELETE'){
        try{
            const AssemblyLine = await Line.destroy({
                where: {
                    id: req.query.id
                }
            })

            if(!AssemblyLine){
                return res.status(200).json({
                    message: "Xóa dây chuyền thất bại!",
                    success: false,
                    data: null
                })
            }

            res.status(200).json({
                message: "Xóa dây chuyền thành công!",
                success: true,
                data: AssemblyLine
            })
        } catch (error) {
            res.status(200).json({
                message: "Xóa dây chuyền thất bại!",
                success: false,
                data: error
            })
        }
    }
    res.status(200).json({message: "Hello World!"})
}