"use client";
import { useEffect, useState } from "react";
import { sb, inr } from "@/lib/supabase";
import SellerRow from "@/components/SellerRow";
const NEXT: Record<string, string> = { placed: "processing", payment_confirmed: "processing", processing: "packed", packed: "shipped", shipped: "out_for_delivery", out_for_delivery: "delivered" };
export default function Seller() {
  const [sp, setSp] = useState<any>(undefined), [prods, setProds] = useState<any[]>([]), [items, setItems] = useState<any[]>([]), [cats, setCats] = useState<any[]>([]), [msg, setMsg] = useState("");
  const [f, setF] = useState({ name: "", category_id: "", price: "", discount_price: "", description: "", image: "", stock: "10" });
  const [a, setA] = useState({ seller_name: "", business_name: "", mobile: "", business_address: "" });
  const load = async () => {
    const { data: { user } } = await sb.auth.getUser(); if (!user) { location.href = "/login"; return; }
    const { data: s } = await sb.from("seller_profiles").select("*").eq("user_id", user.id).maybeSingle(); setSp(s);
    if (!s) return;
    const [p, i, c] = await Promise.all([
      sb.from("products").select("id,name,price,discount_price,approval,is_published,inventory(quantity)").eq("seller_id", s.id).order("created_at", { ascending: false }),
      sb.from("order_items").select("id,product_name,quantity,line_total,status,orders(order_number,shipping_address,payment_method)").eq("seller_id", s.id).order("created_at", { ascending: false }),
      sb.from("categories").select("id,name").eq("is_active", true)]);
    setProds(p.data || []); setItems(i.data || []); setCats(c.data || []);
  };
  useEffect(() => { load(); }, []);
  const apply = async (e: React.FormEvent) => { e.preventDefault(); const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from("seller_profiles").insert({ ...a, user_id: user!.id, email: user!.email }); setMsg(error ? (error.message.includes("check") ? "Mobile must be 10 digits starting 6-9." : error.message) : "Application sent – wait for admin approval."); load(); };
  const add = async (e: React.FormEvent) => { e.preventDefault(); setMsg("");
    const slug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const { data: p, error } = await sb.from("products").insert({ seller_id: sp.id, category_id: f.category_id, name: f.name, slug, description: f.description, price: +f.price, discount_price: f.discount_price ? +f.discount_price : null }).select("id").single();
    if (error) return setMsg(error.message);
    await sb.from("inventory").insert({ product_id: p.id, quantity: +f.stock }); if (f.image) await sb.from("product_images").insert({ product_id: p.id, url: f.image });
    setMsg("Product submitted for admin approval."); setF({ ...f, name: "", price: "", discount_price: "", description: "", image: "" }); load(); };
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setMsg("Uploading image…");
    const { data: { session } } = await sb.auth.getSession();
    const sg = await (await fetch("/api/cloudinary/sign", { method: "POST", headers: { Authorization: "Bearer " + session?.access_token } })).json(); if (!sg.signature) return setMsg("Image upload is not configured (Cloudinary keys missing).");
    const fd = new FormData(); fd.append("file", file); fd.append("api_key", sg.apiKey); fd.append("timestamp", sg.timestamp); fd.append("signature", sg.signature); fd.append("folder", sg.folder);
    const r = await (await fetch(`https://api.cloudinary.com/v1_1/${sg.cloudName}/image/upload`, { method: "POST", body: fd })).json();
    r.secure_url ? (setF(x => ({ ...x, image: r.secure_url })), setMsg("Image uploaded ✓")) : setMsg(r.error?.message || "Upload failed"); };
  const step = async (id: string, s: string) => { const { error } = await sb.rpc("set_item_status", { p_item: id, p_status: s }); if (error) setMsg(error.message); load(); };
  if (sp === undefined) return <p className="p-10 text-center">Loading…</p>;
  if (!sp) return (<main className="mx-auto max-w-md space-y-3 px-4 py-10"><h1 className="text-2xl font-bold">Become a seller</h1>
    <form onSubmit={apply} className="space-y-3">{(Object.keys(a) as (keyof typeof a)[]).map(k => <input key={k} required className="inp" placeholder={k.replace("_", " ")} value={a[k]} onChange={e => setA({ ...a, [k]: e.target.value })} />)}<button className="bt w-full">Apply</button></form><p className="text-sm">{msg}</p></main>);
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">{sp.business_name} <span className="rounded-full bg-navy px-3 py-0.5 text-xs uppercase text-white">{sp.status}</span></h1>
      {msg && <p className="rounded-xl bg-amber-50 p-3 text-sm">{msg}</p>}
      {sp.status === "approved" && <form onSubmit={add} className="dg gap-2 rounded-2xl border bg-white p-4 sm:grid-cols-2"><h2 className="font-bold sm:col-span-2">Add product</h2>
        <input required className="inp" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
        <select required className="inp" value={f.category_id} onChange={e => setF({ ...f, category_id: e.target.value })}><option value="">Category…</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <input required type="number" className="inp" placeholder="MRP ₹" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
        <input type="number" className="inp" placeholder="Sale price ₹" value={f.discount_price} onChange={e => setF({ ...f, discount_price: e.target.value })} />
        <input type="number" className="inp" placeholder="Stock" value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} />
        <input type="file" accept="image/*" className="inp" onChange={upload} />{f.image && <img src={f.image} alt="" className="h-16 w-16 rounded object-cover" />}
        <textarea className="inp sm:col-span-2" placeholder="Description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /><button className="bt sm:col-span-2">Submit for approval</button></form>}
      <div><h2 className="mb-2 font-bold">My products</h2>{prods.map(p => <SellerRow key={p.id} p={p} onSaved={load} />)}</div>
      <div><h2 className="mb-2 font-bold">Orders to fulfil</h2>{items.map(i => <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-b bg-white p-3 text-sm"><span><b>{i.orders.order_number}</b> · {i.product_name} × {i.quantity} · {inr(i.line_total)}<br /><small className="text-slate-500">{i.orders.shipping_address.full_name}, {i.orders.shipping_address.city} · {i.orders.payment_method.toUpperCase()}</small></span>
        <span className="flex items-center gap-2"><b className="uppercase">{i.status.replace(/_/g, " ")}</b>{NEXT[i.status] && <button className="bt !py-1 text-xs" onClick={() => step(i.id, NEXT[i.status])}>Mark {NEXT[i.status].replace(/_/g, " ")}</button>}{NEXT[i.status] && <button className="text-xs text-red-600" onClick={() => step(i.id, "cancelled")}>Cancel</button>}</span></div>)}</div>
    </main>
  );
}
