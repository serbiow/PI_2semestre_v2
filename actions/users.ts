'use server'

import { sql } from "@vercel/postgres"
import { object, z } from "zod"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"
import { user } from "#/types/user"
import { auth, signIn } from "#/app/auth/providers"
import { signOut } from "#/app/auth/providers"
import { revalidatePath } from "next/cache"

const UserSchemaCreate = z.object({
    name: z
        .string({ required_error: 'O nome é obrigatório' })
        .min(3, 'O nome deve conter pelo menos 3 caracteres'),
    email: z.string().email('Insira um e-mail válido'),
    password: z.string().min(8, 'A senha deve conter no minimo 8 caracteres'),
    password2: z.string().min(8, 'A senha deve conter no minimo 8 caracteres'),
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

export async function getUserById(id: string) {
    try {
        const { rows } = await sql<user>`SELECT * FROM usuario WHERE id = ${id}`
        return rows[0]
    } catch (error) {
        throw new Error('Este usuário não existe')
    }
}

export async function getUserByEmail(email: string | null | undefined) {
    try {
        const { rows } = await sql<user>`SELECT * FROM usuario WHERE email = ${email}`
        if (rows == undefined || rows == null) {
        }
        return rows[0]
    } catch (error) {
        throw new Error('Este usuário não existe')
    }
}

// const UserSchemaLogin = z.object({
//     email: z.string().email('Insira um e-mail válido'),
//     password: z.string().min(8, 'A senha deve conter no minimo 8 caracteres'),
// })

// const LoginUser = UserSchemaLogin

// type LoginUserState = {
//     errors?: {
//         email?: string[]
//         password?: string[]
//     }
// }

export async function authenticate(state: string | undefined, formData: FormData) {
    // const validatedFields = LoginUser.safeParse({
    //     email: formData.get('email'),
    //     password: formData.get('password')
    // })

    // if (!validatedFields.success) {
    //     return {
    //         errors: validatedFields.error.flatten().fieldErrors,
    //         message: 'Preencha todos os campos'
    //     }
    // }
    
    try {
        await signIn('credentials', Object.fromEntries(formData))
    } catch (error) {
        if ((error as Error).message.includes('CredentialsSignIn')) return 'CredentialsSignin'
        throw error
    }
}

export async function deleteUser(id: String) {
    const stringId = id + ''

    const schema = z.object({
        id: z.string().min(1),
    });

    const data = schema.parse({
        id: stringId,
    });

    try {
        await sql`
        DELETE FROM usuario
        WHERE id = ${data.id};
        `

        signOut()

    } catch (e) {
        return { message: "Falha ao deletar usuário" };
    }
    revalidatePath("/profile")
    redirect("/auth/login")
}

const UserSchemaUpdate = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    password2: z.string(),
    phone: z.string()
}).refine((data) => data.password === data.password2, {
    message: "As senhas não coincidem.",
    path: ["password2"],
});

const UpdateUser = UserSchemaUpdate

type UpdateUserState = {
    errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
        password2?: string[]
        phone?: string[]
    }
}

export async function updateUser(state: UpdateUserState, formData: FormData) {
    const validatedFields = UpdateUser.safeParse({
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

    var { name, email, password, phone } = validatedFields.data
    const session = await auth();
    const emailSession = session?.user?.email;
    const user = await getUserByEmail(emailSession);

    {/*name*/}
    if (name == undefined || name == null || name == ""){
        name = user.name;
    }
    else if (name.length < 3){
        return { message: 'Falha ao atualizar dados' }
    }

    {/*email*/}
    if (email == undefined || email == null || email == ""){
        email = user.email;
    }

    {/*phone*/}
    if (phone == undefined || phone == null || phone == ""){
        phone = user.phone;
    }
    else if (phone.length != 11){
        return { message: 'Falha ao atualizar dados' }
    }

    {/*password*/}
    if (password == undefined || password == null || password == ""){
        await sql`UPDATE usuario
        set name = ${name},
        email = ${email},
        phone = ${phone}
        WHERE id = ${user.id}`

        await signOut();
        return { message: 'Usuario alterado'}
    }
    else if (password.length < 8){
        return { message: 'Falha ao atualizar dados' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await sql`UPDATE usuario
        set name = ${name},
        email = ${email},
        password = ${hashedPassword},
        phone = ${phone}
        WHERE id = ${user.id}`

        await signOut();
    } catch (error) {
        return { message: 'Falha ao inserir usuário no banco de dados' }
    }
    redirect('/auth/login')
}