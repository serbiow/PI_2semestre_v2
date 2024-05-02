import { DeleteForm } from "./deleteUser-form";
//import { updateUser } from "#/actions/users";

import { useFormState } from "react-dom"
import { getUserByEmail } from "#/actions/users";
import { auth } from "../auth/providers";

export async function ProfileForm(){
    const session = await auth()
    const email = session?.user?.email
    const user = await getUserByEmail(email);

    //const [state, dispatch] = useFormState(updateUser, undefined)
    return(
        <div>
            <form action=""> {/*action={dispatch}*/}
                <input type="text" value={user.name}/>
                <br />
                <input type="text" value={user.email}/>
                
            </form>
            <DeleteForm id={user.id} />
        </div>
    )
}