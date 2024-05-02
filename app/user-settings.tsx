import { auth, signOut } from "./auth/providers";

export async function UserSettings() {
  const session = await auth();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <form action={async () => {
          'use server'
          await signOut()
        }}>
          <button type="submit" className="hover:underline">Sair</button>
        </form>
      </div>
    )
  }
  else {
    return (
      null
    )
  }
}