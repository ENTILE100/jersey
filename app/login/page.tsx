"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else setMsg("Check your email to confirm, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMsg(error.message);
      else {
        router.push("/");
        router.refresh();
      }
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-semibold">
        {mode === "login" ? "Log in" : "Create account"}
      </h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn w-full" disabled={busy}>
          {busy ? "..." : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      {msg && <p className="mt-4 text-sm text-neutral-600">{msg}</p>}

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-6 text-sm text-neutral-500 underline"
      >
        {mode === "login"
          ? "New here? Create an account"
          : "Already have an account? Log in"}
      </button>
    </div>
  );
}
