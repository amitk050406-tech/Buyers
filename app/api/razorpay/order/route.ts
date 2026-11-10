import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/admin";
export async function POST(req: Request) {
  const user = await userFromRequest(req); if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { orderId } = await req.json();
  const { data: o } = await admin.from("orders").select("id,order_number,total,payment_status,user_id").eq("id", orderId).single();
  if (!o || o.user_id !== user.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (o.payment_status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });
  const key = process.env.RAZORPAY_KEY_ID!, secret = process.env.RAZORPAY_KEY_SECRET!;
  const r = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64") },
    body: JSON.stringify({ amount: Math.round(Number(o.total) * 100), currency: "INR", receipt: o.order_number }) });
  const rz = await r.json(); if (!r.ok) return NextResponse.json({ error: rz.error?.description || "Razorpay error" }, { status: 502 });
  await admin.from("payments").insert({ order_id: o.id, gateway: "razorpay", gateway_order_id: rz.id, amount: o.total });
  return NextResponse.json({ keyId: key, razorpayOrderId: rz.id, amount: rz.amount, orderNumber: o.order_number, email: user.email });
}
