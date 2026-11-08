"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-10 space-y-4">
      <label className="block">
        <span className="admin-label">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          className="admin-input"
          placeholder="••••••••••"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-300/90">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-key w-full justify-center disabled:opacity-60">
        {pending ? "Opening…" : "Enter"}
      </button>
    </form>
  );
}
