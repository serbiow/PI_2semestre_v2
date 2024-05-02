import type { NextAuthConfig } from "next-auth"

export const authConfig = { 
    pages: {signIn: '/auth/login', profile: '/profile'},
    callbacks:{
        authorized({auth, request: {nextUrl}}){
            const isLoggedIn = !!auth?.user
            const isPrivateRouter = nextUrl.pathname.startsWith('/private')
            const isAuthRouters = nextUrl.pathname.startsWith('/auth')
            const isProfileRouter = nextUrl.pathname.startsWith('/profile')

            if(!isLoggedIn && isPrivateRouter){
                return false
            }

            if(!isLoggedIn && isProfileRouter){
                return false
            }

            if(isLoggedIn && isAuthRouters){
                return Response.redirect(new URL('/private', nextUrl))
            }

            return true
        },
        jwt({token, user}){
            if(user) token.role = user.role
            return token
        },
        session({session}){
            return session
        }
    },
    providers: []
} as NextAuthConfig