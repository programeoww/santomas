import {User} from "../../../../models";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    if(req.method === 'POST'){
        try {
            req.body.password = await bcrypt.hash(req.body.password, 10)
            const user = await User.create(req.body)
            res.status(200).json({
                message: "Tạo người dùng thành công!",
                success: true,
                data: user
            })
        } catch (error) {
            res.status(200).json({
                message: "Tạo người dùng thất bại!",
                success: false,
                data: error
            })
        }
    }
    res.status(200).json({message: "Hello World!"})
}
