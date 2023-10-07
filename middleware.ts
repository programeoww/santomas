import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken';
import process from 'process';
 
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    if(request.method === 'POST'){
        const authHeader = request.headers.get("Authorization");
        const token = authHeader && authHeader.split(" ")[1];
        
        if (!authHeader) {
            return NextResponse.json({ message: "No token provided!" }, { status: 401 })
        }else if(token && process.env.JWT_SECRET){
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                NextResponse.next()
            } catch (error) {
                if(error instanceof jwt.TokenExpiredError){
                    return NextResponse.json({ message: "Token expired!" }, { status: 401 })
                }else if(error instanceof jwt.JsonWebTokenError){
                    return NextResponse.json({ message: "No token provided!" }, { status: 401 })
                }
            }
        }else{
            return NextResponse.json({ message: "No token provided!" }, { status: 401 })
        }
    }
    
    return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    'api/lines/*',
  ],
}