"use client";
import { useEffect, useState } from "react";
import { sb, inr } from "@/lib/supabase";
const blank = { full_name: "", phone: "", line1: "", city: "", state: "", pincode: "" };
export default function Checkout() {
  const [addrs, setAddrs] = useState<any[]>([]), [sel, setSel] = useState(""), [form, setForm] = useState(blank), [method, setMethod] = useState("cod"), [delivery, setDelivery] = useState("standard"), [coupon, setCoupon] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [sub, setSub] = useState(0);
  useEffect(() => { (async () => {
    const { data: a } = await sb.from("addresses").select("*").order("is_default", { ascending: false }); setAddrs(a || []); if (a?.[0]) setSel(a[0].id);
    const { data: c } = await sb.from("cart_items").select("quantity,products(price,discount_price)").eq("saved_for_later", false);
    setSub((c || []).reduce((s: number, i: any) => s + Number(i.products.discount_price ?? i.products.price) * i.quantity, 0));
  })(); }, []);
  const saveAddr = async () => {
    const { data: { user } } = await sb.auth.getUser(); if (!user) { location.href = "/login"; return; }
    const { data, error } = await sb.from("addresses").insert({ ...form, user_id: user.id, is_default: !addrs.length }).select().single();
    if (error) return setErr(error.message.includes("check") ? "Check phone (10 digits, starts 6-9) and 6-digit pincode." : error.message);
    setAddrs([...addrs, data]); setSel(data.id); setForm(blank); setErr("");
  };
  const place = async () => {
    setBusy(true); setErr("");
    const { data, error } = await sb.rpc("place_order", { p_address_id: sel, p_method: method, p_delivery: delivery, p_coupon: coupon || null });
    if (error) { setBusy(false); return setErr(error.message); }
    window.dispatchEvent(new Event("cart-changed"));
    if (method === "cod") return (location.href = "/orders?placed=" + data);
    const { data: { session } } = await sb.auth.getSession(), auth = { "Content-Type": "application/json", Authorization: "Bearer " + session?.access_token };
    const r = await fetch("/api/razorpay/order", { method: "POST", headers: auth, body: JSON.stringify({ orderId: data }) }), rz = await r.json();
    if (!r.ok) { setBusy(false); return setErr(rz.error + " – your order is saved; pay later from Orders."); }
    await new Promise<void>(res => { if ((window as any).Razorpay) return res(); const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = () => res(); document.body.append(s); });
    new (window as any).Razorpay({ key: rz.keyId, amount: rz.amount, currency: "INR", name: "Buyers", order_id: rz.razorpayOrderId, prefill: { email: rz.email }, theme: { color: "#FF8500" },
      handler: async (resp: any) => { const v = await fetch("/api/razorpay/verify", { method: "POST", headers: auth, body: JSON.stringify(resp) }); location.href = v.ok ? "/orders?placed=" + data : "/orders"; },
      modal: { ondismiss: () => { location.href = "/orders"; } } }).open();
  };
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Checkout <span className="text-base font-normal text-slate-500">(subtotal {inr(sub)})</span></h1>
      <div><h2 className="mb-2 font-bold">Delivery address</h2>
        {addrs.map(a => <label key={a.id} className="mb-2 flex gap-3 rounded-xl border bg-white p-3"><input type="radio" checked={sel === a.id} onChange={() => setSel(a.id)} /><span className="text-sm"><b>{a.full_name}</b> · {a.phone}<br />{a.line1}, {a.city}, {a.state} {a.pincode}</span></label>)}
        <details className="rounded-xl border bg-white p-3" open={!addrs.length}><summary className="cursor-pointer font-semibold">+ Add new address</summary>
          <div className="mt-3 dg gap-2 sm:grid-cols-2">{(Object.keys(blank) as (keyof typeof blank)[]).map(k => <input key={k} className="inp" placeholder={k.replace("_", " ")} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />)}</div>
          <button className="bt mt-3" onClick={saveAddr}>Save address</button></details></div>
      <div className="dg gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Delivery<select className="inp mt-1" value={delivery} onChange={e => setDelivery(e.target.value)}><option value="standard">Standard (₹49, free above ₹499)</option><option value="express">Express (₹99)</option></select></label>
        <label className="text-sm font-semibold">Payment<select className="inp mt-1" value={method} onChange={e => setMethod(e.target.value)}><option value="cod">Cash on Delivery</option><option value="upi">UPI</option><option value="card">Card</option><option value="netbanking">Net Banking</option></select></label>
        <input className="inp sm:col-span-2" placeholder="Coupon code (try WELCOME10)" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} /></div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="bt w-full" disabled={!sel || busy} onClick={place}>{busy ? "Placing…" : "Place order"}</button>
    </main>
  );
}
