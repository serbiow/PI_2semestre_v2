import NextAuth, {type DefaultSession, DefaultJWT} from "next-auth"

declare module 'next-auth' {
    interface User {
        id: string
        name: string
        email: string
        role: string
    }

    interface Session {
        user: {
            role: string
        } & DefaultSession["user"]
    }
}

declare module '@auth/core/jwt'{
    interface JWT {
        role: string
    }
}