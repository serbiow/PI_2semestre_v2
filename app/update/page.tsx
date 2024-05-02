import { AlterForm } from "./update-form";

export default function ProfilePage() {
    return (
        <main className='flex min-h-screen flex-col items-center justify-between p-24'>
            <section>
                <div>
                    <h1>Usuário</h1>
                    <AlterForm/>
                </div>
            </section>
        </main>
    );
}