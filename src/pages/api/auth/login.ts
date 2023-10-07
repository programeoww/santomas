import { NextApiRequest, NextApiResponse } from 'next';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User} from '../../../../models';
import moment from 'moment';

const credentialSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'POST'){
        try {
            const { error } = credentialSchema.validate(req.body, { abortEarly: false })
        
            if(error){
                const errors = error.details.map((err) => {
                    return{
                        path: err.path[0],
                        message: err.message
                    }
                });
                return res.status(200).json({
                    success: false,
                    message: "",
                    errors
                });
            }

            const user = await User.findOne({
                where: {
                    username: req.body.username
                }
            })

            if(!user){
                return res.status(200).json({
                    success: false,
                    message: 'Sai tên đăng nhập hoặc mật khẩu'
                })
            }

            const isMatch = await bcrypt.compare(req.body.password, user.dataValues.password);

            if(!isMatch){
                return res.status(200).json({
                    success: false,
                    message: 'Sai tên đăng nhập hoặc mật khẩu'
                })
            }

            const token = jwt.sign({ id: user.dataValues.id }, process.env.JWT_SECRET!, {
                expiresIn: '1d'
            })

            const expiryIn = new Date(moment().format());
            expiryIn.setDate(expiryIn.getDate() + 30);
            // expiryIn.setSeconds(expiryIn.getSeconds() + 5);

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    ...user.dataValues,
                    password: undefined,
                    createdAt: undefined,
                    updatedAt: undefined,
                    accessToken: token,
                    accessTokenExpiry: expiryIn.getTime()
                },
            })
        } catch (error) {
            return res.status(200).json({
                success: false,
                message: 'Đăng nhập thất bại',
            })
        }
    }
}