"use client";

import { useFormState, useFormStatus } from "react-dom";
import { deleteUser } from "#/actions/users";
//import { signOut } from "../auth/providers";

const initialState = {
  message: "",
};

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" aria-disabled={pending}>
      Delete
    </button>
  );
}

export function DeleteForm({ id }: { id: string }) {
  const [state, formAction] = useFormState(deleteUser, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
      <p aria-live="polite" className="sr-only" role="status">
        {state?.message}
      </p>
    </form>
  );
}