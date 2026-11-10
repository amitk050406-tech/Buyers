"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sb, inr } from "@/lib/supabase";
export default function Orders() {
  const [o, setO] = useState<any[] | null>(null);
  useEffect(() => { sb.from("orders").select("id,order_number,status,payment_method,payment_status,total,estimated_delivery,created_at,order_items(product_name,quantity,unit_price,image_url)").order("created_at", { ascending: false }).then(({ data }) => setO(data || [])); }, []);
  if (!o) return <p className="p-10 text-center">Loading…</p>;
  return (<div className="wrap" style={{ padding: "32px 20px", maxWidth: 800 }}><h2>My Orders</h2>
    {typeof location !== "undefined" && location.search.includes("placed") && <p className="mb-4 rounded-xl bg-green-50 p-3 font-semibold text-green-700">🎉 Order placed successfully!</p>}
    {!o.length && <p className="empty">No orders yet (log in to see yours). <Link href="/shop" className="text-brand">Start shopping</Link></p>}
    {o.map(x => <Link href={`/orders/${x.id}`} key={x.id} className="card mb-3 block">
      <div className="flex justify-between text-sm"><b>{x.order_number}</b><span className="rounded-full bg-navy px-3 py-0.5 text-xs font-bold uppercase text-white">{x.status.replace(/_/g, " ")}</span></div>
      {x.order_items.map((i: any, k: number) => <div key={k} className="mt-2 flex items-center gap-3 text-sm"><img src={i.image_url} alt="" className="h-10 w-10 rounded object-cover" />{i.product_name} × {i.quantity}<span className="ml-auto">{inr(i.unit_price * i.quantity)}</span></div>)}
      <div className="mt-3 flex justify-between border-t pt-2 text-sm"><span>{x.payment_method.toUpperCase()} · {x.payment_status.replace("_", " ")}</span><b>{inr(x.total)}</b></div></Link>)}</div>);
}
