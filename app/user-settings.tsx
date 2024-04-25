import { signOut } from "./auth/providers";

export function UserSettings() {
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