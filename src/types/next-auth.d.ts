import IUser from "@/interfaces/user";
import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken:string,
    accessTokenExpiry: number,
    error: string
    user: IUser
  }
}