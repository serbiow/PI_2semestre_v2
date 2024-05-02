"use client";

import { deleteUser } from "#/actions/users";

function DeleteButton() {
  return (
    <button type="submit" >
      Deletar conta
    </button>
  );
}

export function DeleteForm({ id }: { id: string }) {
  const deleteUserWithId = deleteUser.bind(null, id)

  return (
    <form action={deleteUserWithId}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}