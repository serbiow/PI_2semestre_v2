import type { NextAuthConfig } from "next-auth"

export const authConfig = { 
    pages: {signIn: '/auth/login'},
    callbacks:{
        authorized({auth, request: {nextUrl}}){
            const isLoggedIn = !!auth?.user
            const isPrivateRouter = nextUrl.pathname.startsWith('/private')
            const isAuthRouters = nextUrl.pathname.startsWith('/auth')
            const isProfileRouter = nextUrl.pathname.startsWith('/profile')
            const isUpdateRouter = nextUrl.pathname.startsWith('/update')

            if(!isLoggedIn && isPrivateRouter){
                return false
            }

            if(!isLoggedIn && isProfileRouter){
                return false
            }

            if(!isLoggedIn && isUpdateRouter){
                return false
            }

            if(isLoggedIn && isAuthRouters){
                return Response.redirect(new URL('/profile', nextUrl))
            }

            return true
        },
        jwt({token, user}){
            console.log("token:", token)
            if(user) token.role = user.role
            return token
        },
        session({session, token }){
            console.log("session:", session)
            if (token.role) session.user.role = token.role
            return session
        }
    },
    providers: []
} as NextAuthConfig