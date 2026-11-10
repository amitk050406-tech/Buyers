import { NextResponse } from "next/server";
import crypto from "crypto";
import { admin, userFromRequest } from "@/lib/admin";
export async function POST(req: Request) {
  const user = await userFromRequest(req); if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = await req.json();
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(`${oid}|${pid}`).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(String(sig || ""));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  const { data: pay } = await admin.from("payments").select("id,order_id,status,orders(user_id)").eq("gateway_order_id", oid).single();
  if (!pay || (pay as any).orders?.user_id !== user.id) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (pay.status !== "paid") {
    await admin.from("payments").update({ status: "paid", gateway_payment_id: pid, signature_verified: true, verified_at: new Date().toISOString() }).eq("id", pay.id);
    await admin.from("orders").update({ payment_status: "paid", status: "payment_confirmed" }).eq("id", pay.order_id);
    await admin.from("order_items").update({ status: "payment_confirmed" }).eq("order_id", pay.order_id);
    await admin.from("order_status_history").insert({ order_id: pay.order_id, status: "payment_confirmed", note: "Razorpay payment verified" });
  }
  return NextResponse.json({ ok: true });
}
