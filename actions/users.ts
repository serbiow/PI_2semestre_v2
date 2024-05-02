'use server'

import { sql } from "@vercel/postgres"
import { object, z } from "zod"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"
import { user } from "#/types/user"
import { signIn } from "#/app/auth/providers"
import { signOut } from "#/app/auth/providers"

const UserSchemaCreate = z.object({
    name: z
        .string({ required_error: 'O nome é obrigatório' })
        .min(3, 'O nome deve conter pelo menos 3 caracteres'),
    email: z.string().email('Insira um e-mail válido'),
    password: z.string().min(8, 'A senha deve conter no minimo 8 caracteres'),
    password2: z.string(),
    phone: z.string().length(11, 'O telefone deve conter 11 digitos')
}).refine((data) => data.password === data.password2, {
    message: "As senhas não coincidem.",
    path: ["password2"],
});

const CreateUser = UserSchemaCreate

type CreateUserState = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        password2?: string[]
        phone?: string[]
    }
}

export async function createUser(state: CreateUserState, formData: FormData) {
    const validatedFields = CreateUser.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        password2: formData.get('password2'),
        phone: formData.get('phone'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Preencha todos os campos'
        }
    }

    const { name, email, password, phone } = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)
    const role = 'user'

    try {
        await sql`INSERT INTO usuario (name, email, password, phone, role) VALUES (${name}, ${email}, ${hashedPassword}, ${phone}, ${role})`
    } catch (error) {
        return { message: 'Falha ao inserir usuário no banco de dados' }
    }

    redirect('/auth/login')
}

export async function deleteUser(
    prevState: {
        message: string;
    },
    formData: FormData,
) {
    const schema = z.object({
        id: z.string().min(1),
    });
    const data = schema.parse({
        id: formData.get("id"),
    });

    try {
        await Promise.all([
            sql`
            DELETE FROM usuario
            WHERE id = ${data.id};
            `,
            signOut({redirect: true, redirectTo: 'localhost:3000/'})
        ])

        return { Message: "Usuário deletado" }
    } catch (e) {
        return { message: "Falha ao deletar usuário" };
    }
}

export async function getUserByEmail(email: string) {
    try {
        const { rows } = await sql<user>`SELECT * FROM usuario WHERE email = ${email}`
        return rows[0]
    } catch (error) {
        throw new Error('Este usuário não existe')
    }
}

export async function authenticate(state: String | undefined, formData: FormData) {
    try {
        await signIn('credentials', Object.fromEntries(formData))
    } catch (error) {
        if ((error as Error).message.includes('CredentialsSignIn')) return 'CredentialsSignin'
        throw error
    }
}