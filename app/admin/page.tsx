"use client";
import { useEffect, useState } from "react";
import { sb, inr } from "@/lib/supabase";
import AdminExtras from "@/components/AdminExtras";
export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null), [sellers, setSellers] = useState<any[]>([]), [prods, setProds] = useState<any[]>([]), [orders, setOrders] = useState<any[]>([]), [stats, setStats] = useState<any>({}), [msg, setMsg] = useState("");
  const load = async () => {
    const { data: { user } } = await sb.auth.getUser(); if (!user) { location.href = "/login"; return; }
    const { data: me } = await sb.from("users").select("role").eq("id", user.id).single(); if (me?.role !== "admin") return setOk(false); setOk(true);
    const [s, p, o] = await Promise.all([
      sb.from("seller_profiles").select("id,user_id,business_name,seller_name,mobile,status").order("created_at", { ascending: false }),
      sb.from("products").select("id,name,price,approval,is_published,seller_profiles(business_name)").eq("approval", "pending"),
      sb.from("orders").select("id,order_number,status,total,payment_method,created_at").order("created_at", { ascending: false }).limit(20)]);
    setSellers(s.data || []); setProds(p.data || []); setOrders(o.data || []);
    const { count: uc } = await sb.from("users").select("*", { count: "exact", head: true }); const { count: oc } = await sb.from("orders").select("*", { count: "exact", head: true });
    setStats({ users: uc, orders: oc });
  };
  useEffect(() => { load(); }, []);
  const seller = async (s: any, status: string) => { const r = await sb.from("seller_profiles").update({ status, approved_at: status === "approved" ? new Date().toISOString() : null }).eq("id", s.id);
    if (status === "approved") await sb.from("users").update({ role: "seller" }).eq("id", s.user_id); setMsg(r.error?.message || ""); load(); };
  const prod = async (id: string, approve: boolean) => { const r = await sb.from("products").update({ approval: approve ? "approved" : "rejected", is_published: approve }).eq("id", id); setMsg(r.error?.message || ""); load(); };
  if (ok === null) return <p className="p-10 text-center">Loading…</p>;
  if (!ok) return <p className="p-10 text-center">Admins only.</p>;
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">Admin</h1><p className="text-sm text-slate-600">{stats.users} users · {stats.orders} orders</p>{msg && <p className="text-sm text-red-600">{msg}</p>}
      <div><h2 className="mb-2 font-bold">Sellers</h2>{sellers.map(s => <div key={s.id} className="flex items-center justify-between border-b bg-white p-3 text-sm"><span><b>{s.business_name}</b> · {s.seller_name} · {s.mobile}</span><span className="flex gap-2"><b className="uppercase">{s.status}</b>{s.status !== "approved" && <button className="bt !py-1 text-xs" onClick={() => seller(s, "approved")}>Approve</button>}{s.status !== "suspended" && <button className="text-xs text-red-600" onClick={() => seller(s, s.status === "approved" ? "suspended" : "rejected")}>{s.status === "approved" ? "Suspend" : "Reject"}</button>}</span></div>)}</div>
      <div><h2 className="mb-2 font-bold">Products awaiting approval</h2>{!prods.length && <p className="text-sm text-slate-500">None.</p>}{prods.map(p => <div key={p.id} className="flex items-center justify-between border-b bg-white p-3 text-sm"><span>{p.name} · {inr(p.price)} · {p.seller_profiles?.business_name}</span><span className="flex gap-2"><button className="bt !py-1 text-xs" onClick={() => prod(p.id, true)}>Approve</button><button className="text-xs text-red-600" onClick={() => prod(p.id, false)}>Reject</button></span></div>)}</div>
      <div><h2 className="mb-2 font-bold">Recent orders</h2>{orders.map(o => <div key={o.id} className="flex justify-between border-b bg-white p-3 text-sm"><span>{o.order_number} · {o.payment_method.toUpperCase()}</span><span>{o.status.replace(/_/g, " ")} · {inr(o.total)}</span></div>)}</div>
    <AdminExtras />
    </main>
  );
}
