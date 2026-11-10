"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sb, inr } from "@/lib/supabase";
const FLOW = ["placed", "payment_confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
export default function OrderPage({ params }: { params: { id: string } }) {
  const [o, setO] = useState<any>(null), [h, setH] = useState<any[]>([]), [m, setM] = useState("");
  const load = async () => { const [a, b] = await Promise.all([sb.from("orders").select("*,order_items(id,product_id,product_name,quantity,unit_price,line_total,image_url,status,products(slug))").eq("id", params.id).single(), sb.from("order_status_history").select("status,note,created_at").eq("order_id", params.id).order("created_at")]); setO(a.data); setH(b.data || []); };
  useEffect(() => { load(); }, []);
  const rpc = async (fn: string, args: any) => { const { error } = await sb.rpc(fn, args); setM(error ? error.message : "Done."); load(); };
  const pay = async () => {
    const { data: { session } } = await sb.auth.getSession(), auth = { "Content-Type": "application/json", Authorization: "Bearer " + session?.access_token };
    const rz = await (await fetch("/api/razorpay/order", { method: "POST", headers: auth, body: JSON.stringify({ orderId: o.id }) })).json(); if (!rz.razorpayOrderId) return setM(rz.error || "Payment error");
    await new Promise<void>(res => { if ((window as any).Razorpay) return res(); const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = () => res(); document.body.append(s); });
    new (window as any).Razorpay({ key: rz.keyId, amount: rz.amount, currency: "INR", name: "Buyers", order_id: rz.razorpayOrderId, prefill: { email: rz.email }, theme: { color: "#FF8500" }, handler: async (r: any) => { await fetch("/api/razorpay/verify", { method: "POST", headers: auth, body: JSON.stringify(r) }); load(); } }).open();
  };
  if (!o) return <p className="p-10 text-center">Loading…</p>;
  const a = o.shipping_address, step = FLOW.indexOf(o.status), cancelled = o.status === "cancelled";
  return (<div className="wrap" style={{ padding: "32px 20px", maxWidth: 800 }}>
    <Link href="/orders" className="text-sm text-brand">← All orders</Link><h2>Order {o.order_number}</h2>
    <div className="card mb-4">{cancelled || ["return_requested", "refunded"].includes(o.status) ? <b className="uppercase text-red-600">{o.status.replace("_", " ")}</b> : <div className="flex flex-wrap gap-1 text-xs font-bold uppercase">{FLOW.map((s, i) => <span key={s} className={`rounded-full px-2 py-1 ${i <= step ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>{s.replace(/_/g, " ")}</span>)}</div>}
      <div className="mt-3 text-sm text-slate-600">{h.map((x, i) => <div key={i}>{new Date(x.created_at).toLocaleString("en-IN")} – {x.status.replace(/_/g, " ")} {x.note && `(${x.note})`}</div>)}</div></div>
    <div className="card mb-4">{o.order_items.map((i: any) => <div key={i.id} className="flex items-center gap-3 border-b py-2 text-sm"><img src={i.image_url} alt="" className="h-12 w-12 rounded object-cover" /><div className="flex-1"><Link href={`/product/${i.products?.slug}`} className="font-semibold">{i.product_name}</Link><div className="text-xs uppercase text-slate-500">{i.status.replace(/_/g, " ")}</div></div>× {i.quantity}<b>{inr(i.line_total)}</b>{o.status === "delivered" && <Link href={`/product/${i.products?.slug}`} className="text-xs font-bold text-brand">Review</Link>}</div>)}
      <div className="mt-2 space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{inr(o.subtotal)}</span></div><div className="flex justify-between"><span>Discount</span><span>− {inr(o.discount_total)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{inr(o.shipping_fee)}</span></div><div className="flex justify-between text-lg font-bold"><span>Total</span><span>{inr(o.total)}</span></div></div></div>
    <div className="card mb-4 text-sm"><b>Delivering to</b><br />{a.full_name} · {a.phone}<br />{a.line1}, {a.city}, {a.state} {a.pincode}<br />Payment: {o.payment_method.toUpperCase()} ({o.payment_status.replace("_", " ")}) · ETA {o.estimated_delivery}</div>
    <div className="flex flex-wrap gap-3">
      {o.payment_status === "pending" && o.payment_method !== "cod" && !cancelled && <button className="bt" onClick={pay}>Pay now</button>}
      {["placed", "payment_confirmed", "processing"].includes(o.status) && <button className="bt !bg-red-600" onClick={() => confirm("Cancel this order?") && rpc("cancel_order", { p_order: o.id })}>Cancel order</button>}
      {o.status === "delivered" && <button className="bt !bg-navy" onClick={() => { const r = prompt("Reason for return?"); if (r) rpc("request_return", { p_order: o.id, p_reason: r }); }}>Return order</button>}
      <button className="bt !bg-white !text-slate-700 border" onClick={() => window.print()}>Print invoice</button></div>
    {m && <p className="mt-3 text-sm">{m}</p>}</div>);
}
