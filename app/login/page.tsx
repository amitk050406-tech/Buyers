"use client";
import { useState } from "react";
import { sb } from "@/lib/supabase";
export default function Login() {
  const [up, setUp] = useState(false), [f, setF] = useState({ name: "", email: "", pw: "" }), [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg("");
    const r = up ? await sb.auth.signUp({ email: f.email, password: f.pw, options: { data: { full_name: f.name } } }) : await sb.auth.signInWithPassword({ email: f.email, password: f.pw });
    if (r.error) return setMsg(r.error.message);
    if (up && !r.data.session) return setMsg("Check your email to confirm your account, then log in.");
    location.href = "/";
  };
  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-4 text-2xl font-bold">{up ? "Create account" : "Log in"}</h1>
      <form onSubmit={submit} className="space-y-3">
        {up && <input className="inp" placeholder="Full name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />}
        <input className="inp" type="email" placeholder="Email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
        <input className="inp" type="password" minLength={6} placeholder="Password (6+ characters)" required value={f.pw} onChange={e => setF({ ...f, pw: e.target.value })} />
        <button className="bt w-full">{up ? "Sign up" : "Log in"}</button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </form>
      <button className="mt-4 text-sm font-semibold text-brand" onClick={() => setUp(!up)}>{up ? "Have an account? Log in" : "New here? Create an account"}</button>
    </main>
  );
}
