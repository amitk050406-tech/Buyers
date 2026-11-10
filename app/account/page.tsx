"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sb } from "@/lib/supabase";
import { useStore } from "@/lib/store";
const blank = { full_name: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "" };
export default function Account() {
  const { user, toast } = useStore(), [me, setMe] = useState({ full_name: "", phone: "" }), [addrs, setAddrs] = useState<any[]>([]), [notes, setNotes] = useState<any[]>([]), [f, setF] = useState(blank), [err, setErr] = useState("");
  const load = async () => { const [u, a, n] = await Promise.all([sb.from("users").select("full_name,phone").single(), sb.from("addresses").select("*").order("is_default", { ascending: false }), sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(10)]);
    if (u.data) setMe({ full_name: u.data.full_name || "", phone: u.data.phone || "" }); setAddrs(a.data || []); setNotes(n.data || []); };
  useEffect(() => { if (user) load(); }, [user?.id]);
  if (!user) return <p className="empty">Please <Link href="/login" className="text-brand">log in</Link>.</p>;
  const saveMe = async () => { const { error } = await sb.from("users").update(me).eq("id", user.id); toast(error ? error.message : "Profile saved"); };
  const add = async () => { const { error } = await sb.from("addresses").insert({ ...f, line2: f.line2 || null, landmark: f.landmark || null, user_id: user.id, is_default: !addrs.length }); if (error) return setErr(error.message.includes("check") ? "Phone must be 10 digits (starts 6-9); pincode 6 digits." : error.message); setErr(""); setF(blank); load(); };
  const def = async (id: string) => { await sb.from("addresses").update({ is_default: false }).eq("user_id", user.id); await sb.from("addresses").update({ is_default: true }).eq("id", id); load(); };
  return (<div className="wrap" style={{ padding: "32px 20px" }}><h2>My Account</h2>
    <div className="dg gap-6 md:grid-cols-2">
      <div className="card space-y-2"><b>Profile</b><p className="text-sm text-slate-500">{user.email}</p><input className="inp" placeholder="Full name" value={me.full_name} onChange={e => setMe({ ...me, full_name: e.target.value })} /><input className="inp" placeholder="Phone" value={me.phone} onChange={e => setMe({ ...me, phone: e.target.value })} /><button className="bt" onClick={saveMe}>Save</button></div>
      <div className="card"><b>Notifications</b>{notes.length ? notes.map(n => <div key={n.id} className="border-b py-2 text-sm"><b>{n.title}</b> <span className="text-slate-500">{n.body}</span></div>) : <p className="text-sm text-slate-500">Nothing new.</p>}</div></div>
    <h3 className="mb-2 mt-8 font-bold">Saved addresses</h3>
    {addrs.map(a => <div key={a.id} className="card mb-2 flex items-center justify-between text-sm"><span><b>{a.full_name}</b> · {a.phone} {a.is_default && <i className="text-brand">Default</i>}<br />{a.line1}, {a.city}, {a.state} {a.pincode}</span><span className="flex gap-3">{!a.is_default && <button className="font-bold text-brand" onClick={() => def(a.id)}>Make default</button>}<button className="text-red-600" onClick={async () => { await sb.from("addresses").delete().eq("id", a.id); load(); }}>Delete</button></span></div>)}
    <div className="card mt-4"><b>Add address</b><div className="dg mt-2 gap-2 sm:grid-cols-2">{(Object.keys(blank) as (keyof typeof blank)[]).map(k => <input key={k} className="inp" placeholder={k.replace("_", " ")} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />)}</div>{err && <p className="mt-2 text-sm text-red-600">{err}</p>}<button className="bt mt-3" onClick={add}>Save address</button></div></div>);
}
