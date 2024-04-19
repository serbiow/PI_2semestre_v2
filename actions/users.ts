'use server'

import { sql } from "@vercel/postgres"
import { object, z } from "zod"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"
import { user } from "#/types/user"
import { signIn } from "#/app/auth/providers"

const UserSchema = z.object({
    id: z.string(),
    name: z
        .string({required_error: 'O nome é obrigatório'})
        .min(3, 'O nome deve conter pelo menos 3 caracteres'),
    email: z.string().email('Insira um e-mail válido'),
    password: z.string().min(8, 'A senha deve conter no minimo 8 caracteres'),
    cpf: z.string().length(11, 'O cpf deve conter 11 digitos'),
    telefone: z.string().length(11, 'O telefone deve conter 11 digitos'),
    role: z.string()
})

const CreateUser = UserSchema.omit({id: true, role: true})

type CreateUserState = {
    errors?:{
       name?: string[] 
       email?: string[] 
       password?: string[]
       telefone?: string[] 
       cpf?: string[] 
    }
}

export async function createUser(state: CreateUserState, formData: FormData){
    const validatedFields = CreateUser.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        telefone: formData.get('telefone'),
        cpf: formData.get('cpf'),
    })

    if(!validatedFields.success){
        return{
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Preencha todos os campos'
        }
    }

    const {name, email, password, telefone, cpf} = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)
    const role = 'user'

    try {
        await sql`
            INSERT INTO USUARIO (USU_STR_NOME, USU_STR_EMAIL, USU_STR_SENHA, USU_STR_TEL, USU_STR_CPF, USU_STR_ROLE)
            VALUES (${name}, ${email}, ${hashedPassword}, ${telefone}, ${cpf}, ${role})
        `
    } catch (error) {
        return{message: 'Falha ao inserir usuário no banco de dados'}
    }

    redirect('/auth/login')
}

export async function getUserByEmail(email: string){
    try {
        const {rows} = await sql<user>`SELECT * FROM USUARIO WHERE USU_STR_EMAIL = ${email}`
        return rows[0]
    } catch (error) {
        throw new Error('Este usuário não existe')
    }
}

export async function authenticate(state: string | undefined, formData: FormData){
    try {
        await signIn('credentials', Object.fromEntries(formData))
    } catch (error) {
        if((error as Error).message.includes('CredentialsSignIn')) return 'CredentialsSignin'
        throw error
    }
}