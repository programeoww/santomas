import IUser from '@/interfaces/user';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { signOut } from 'next-auth/react';
import { Model } from 'sequelize';
import { User } from '../../../../models';

async function refreshAccessToken(tokenObject: { refreshToken: string; }) {
    try {
        // Get a new set of tokens with a refreshToken
        const tokenResponse = await axios.post(process.env.APP_URL + 'api/auth/refreshToken', {
            token: tokenObject.refreshToken
        });

        return {
            ...tokenObject,
            accessToken: tokenResponse.data.accessToken,
            accessTokenExpiry: tokenResponse.data.accessTokenExpiry,
            refreshToken: tokenResponse.data.refreshToken
        }
    } catch (error) {
        return {
            ...tokenObject,
            error: "RefreshAccessTokenError",
        }
    }
}

const providers = [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
            username: { label: "Username", type: "text" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            try {
                // Authenticate user with credentials
                const { data } = await axios.post(process.env.NEXT_PUBLIC_API_URL + 'auth/login', {
                    password: credentials!.password,
                    username: credentials!.username,
                });

                if (data.user.accessToken) {
                    return data.user;
                }

                return null;
            } catch (error) {
                // Return null if user data could not be retrieved
                return null;
            }
        },
    })
]

const callbacks = {
    jwt: async ({ token, user } : { token: any, user: any }) => {
        const userExist = await User.findOne({ where: { id: token.sub } });
        
        if(!userExist) {
            signOut({ callbackUrl: '/login', redirect: true })
            return Promise.resolve(null);
        }

        if (user) {
            // This will only be executed at login. Each next invocation will skip this part.
            token.accessToken = user.accessToken;
            token.accessTokenExpiry = user.accessTokenExpiry;
        }
        
        // If accessTokenExpiry is 24 hours, we have to refresh token before 24 hours pass.
        const shouldRefreshTime = Math.round(token.accessTokenExpiry - Date.now());
        
        // console.log(token.accessTokenExpiry - Date.now());
        
        // If the token is still valid, just return it.
        if (shouldRefreshTime > 0) {
            return Promise.resolve(token);
        }
        // console.log(1);
        
        // signOut({ callbackUrl: '/', redirect: true })
        return Promise.resolve(token);
        // If the call arrives after 23 hours have passed, we allow to refresh the token.
        // token = refreshAccessToken(token);
        // return Promise.resolve(token);
    },
    session: async ({ session, token } : { session: any, token: any, user: any }) => {
        if(token && token.sub && token.accessTokenExpiry - Date.now() > 0) {
            const user = await User.findOne({ where: { id: token.sub } });
            if(user){
                
                const userData: Omit<typeof user.dataValues, 'password'> & { password?: string } = user.dataValues;
                delete userData.password;
                session.user = userData;
            }
            // Here we pass accessToken to the client to be used in authentication with your API
            session.accessToken = token.accessToken;
            session.accessTokenExpiry = token.accessTokenExpiry;
            session.error = token.error;
        }else if(token.accessTokenExpiry - Date.now() < 0){
            session.error = "Unauthorized";
            session.accessToken = null;
            session.accessTokenExpiry = null;
            session.user = {
                name: null,
            };
            return Promise.resolve(session);
        }

        return Promise.resolve(session);
    },
}

export const options = {
    providers,
    callbacks,
    pages: {
        signIn: '/login',
    },
    secret: process.env.JWT_SECRET,
}

const Auth = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options)
export default Auth;