"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sb, inr } from "@/lib/supabase";
export default function Cart() {
  const [items, setItems] = useState<any[] | null>(null), [d, setD] = useState<any>({});
  const load = async () => {
    const { data } = await sb.from("cart_items").select("id,quantity,saved_for_later,products(name,slug,price,discount_price,product_images(url,sort_order))").order("created_at");
    setItems(data || []); window.dispatchEvent(new Event("cart-changed"));
  };
  useEffect(() => { load(); sb.from("platform_settings").select("value").eq("key", "delivery").single().then(({ data }) => setD(data?.value || {})); }, []);
  const upd = async (id: string, patch: any) => { await sb.from("cart_items").update(patch).eq("id", id); load(); };
  const del = async (id: string) => { await sb.from("cart_items").delete().eq("id", id); load(); };
  if (!items) return <p className="p-10 text-center">Loading…</p>;
  const act = items.filter(i => !i.saved_for_later), saved = items.filter(i => i.saved_for_later), pr = (i: any) => Number(i.products.discount_price ?? i.products.price);
  const sub = act.reduce((a, i) => a + pr(i) * i.quantity, 0), mrp = act.reduce((a, i) => a + Number(i.products.price) * i.quantity, 0), ship = !act.length || sub >= (d.free_shipping_above ?? 499) ? 0 : d.standard_fee ?? 49;
  const row = (i: any, sv: boolean) => { const p = i.products, img = [...p.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url; return (
    <div key={i.id} className="flex items-center gap-4 border-b bg-white p-3 text-slate-900">
      <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover" />
      <div className="flex-1"><Link href={`/product/${p.slug}`} className="font-semibold">{p.name}</Link><div>{inr(pr(i))} <s className="text-xs text-slate-400">{inr(p.price)}</s></div>
        <div className="mt-1 flex gap-3 text-xs font-bold uppercase"><button onClick={() => upd(i.id, { saved_for_later: !sv })}>{sv ? "Move to cart" : "Save for later"}</button><button className="text-red-600" onClick={() => del(i.id)}>Remove</button></div></div>
      {!sv && <div className="flex items-center gap-2"><button className="h-8 w-8 rounded-full border" onClick={() => i.quantity > 1 ? upd(i.id, { quantity: i.quantity - 1 }) : del(i.id)}>−</button>{i.quantity}<button className="h-8 w-8 rounded-full border" onClick={() => upd(i.id, { quantity: Math.min(20, i.quantity + 1) })}>+</button></div>}
    </div>); };
  return (
    <div className="wrap" style={{ padding: "32px 20px" }}>
      <h2>Your Cart</h2>
      {!items.length ? <p className="empty">Your cart is empty (or <Link href="/login" className="text-brand">log in</Link>). <Link href="/shop" className="text-brand">Shop now</Link></p> :
      <div className="dg gap-6 md:grid-cols-[1fr_320px]">
        <div>{act.map(i => row(i, false))}{!!saved.length && <><h3 className="mt-6 font-bold">Saved for later</h3>{saved.map(i => row(i, true))}</>}</div>
        <div className="card h-fit space-y-2"><b>Price details</b>
          <div className="flex justify-between"><span>Price ({act.length} items)</span><span>{inr(mrp)}</span></div><div className="flex justify-between text-green-600"><span>Discount</span><span>− {inr(mrp - sub)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{ship ? inr(ship) : "FREE"}</span></div><div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>{inr(sub + ship)}</span></div>
          <p className="text-xs text-green-600">You save {inr(mrp - sub)} on this order</p>
          <Link href="/checkout" className="bt w-full">Place order →</Link></div></div>}
    </div>
  );
}
