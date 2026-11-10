import { NextResponse } from "next/server";
import crypto from "crypto";
import { admin } from "@/lib/admin";
// Backup path: confirms payments even if the customer closes the browser right after paying.
export async function POST(req: Request) {
  const raw = await req.text(), sig = req.headers.get("x-razorpay-signature") || "", eid = req.headers.get("x-razorpay-event-id") || "";
  const exp = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest("hex");
  const a = Buffer.from(exp), b = Buffer.from(sig); if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return NextResponse.json({ error: "bad signature" }, { status: 400 });
  const ev = JSON.parse(raw);
  if (eid) { const { error } = await admin.from("webhook_events").insert({ id: eid, payload: ev }); if (error) return NextResponse.json({ ok: true, duplicate: true }); }
  const pay = ev.payload?.payment?.entity, oid = pay?.order_id; if (!oid) return NextResponse.json({ ok: true });
  const { data: p } = await admin.from("payments").select("id,order_id,status").eq("gateway_order_id", oid).maybeSingle(); if (!p) return NextResponse.json({ ok: true });
  if (ev.event === "payment.captured" || ev.event === "order.paid") {
    if (p.status !== "paid") {
      await admin.from("payments").update({ status: "paid", gateway_payment_id: pay.id, signature_verified: true, verified_at: new Date().toISOString() }).eq("id", p.id);
      await admin.from("orders").update({ payment_status: "paid", status: "payment_confirmed" }).eq("id", p.order_id);
      await admin.from("order_items").update({ status: "payment_confirmed" }).eq("order_id", p.order_id);
      await admin.from("order_status_history").insert({ order_id: p.order_id, status: "payment_confirmed", note: "Razorpay webhook" });
    }
  } else if (ev.event === "payment.failed" && p.status !== "paid") { await admin.from("payments").update({ status: "failed" }).eq("id", p.id); await admin.from("orders").update({ payment_status: "failed" }).eq("id", p.order_id); }
  return NextResponse.json({ ok: true });
}
