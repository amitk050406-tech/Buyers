"use client";
import { useState } from "react";
import { sb } from "@/lib/supabase";
export default function SellerRow({ p, onSaved }: { p: any; onSaved: () => void }) {
  const [price, setPrice] = useState(String(p.price)), [sale, setSale] = useState(p.discount_price ? String(p.discount_price) : ""), [stock, setStock] = useState(String(p.inventory?.[0]?.quantity ?? 0)), [m, setM] = useState("");
  const save = async () => { const a = await sb.from("products").update({ price: +price, discount_price: sale ? +sale : null }).eq("id", p.id); const b = await sb.from("inventory").update({ quantity: +stock }).eq("product_id", p.id); setM(a.error?.message || b.error?.message || "Saved ✓"); onSaved(); };
  return (<div className="flex flex-wrap items-center gap-2 border-b bg-white p-3 text-sm text-slate-900"><span className="min-w-40 flex-1">{p.name} <i className="text-xs uppercase text-slate-500">{p.approval}{p.is_published ? " · live" : ""}</i></span>
    <input className="inp !w-24" type="number" value={price} onChange={e => setPrice(e.target.value)} title="MRP" /><input className="inp !w-24" type="number" placeholder="Sale" value={sale} onChange={e => setSale(e.target.value)} title="Sale price" /><input className="inp !w-20" type="number" value={stock} onChange={e => setStock(e.target.value)} title="Stock" />
    <button className="bt !py-1 text-xs" onClick={save}>Save</button><span className="text-xs">{m}</span></div>);
}
