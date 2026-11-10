"use client";
import Link from "next/link";
import { useState } from "react";
import { addToCart, inr } from "@/lib/supabase";
export default function ProductCard({ p }: { p: any }) {
  const price = Number(p.discount_price ?? p.price), off = Math.round((1 - price / p.price) * 100);
  const img = [...(p.product_images || [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  const [msg, setMsg] = useState("");
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square bg-slate-100">
        {img && <img src={img} alt={p.name} className="h-full w-full object-cover" />}
        {off > 0 && <span className="absolute left-2 top-2 rounded-lg bg-brand px-2 py-0.5 text-xs font-extrabold text-white">{off}% OFF</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm font-semibold">{p.name}</Link>
        <div className="text-xs text-brand">★ {Number(p.rating_avg).toFixed(1)} <span className="text-slate-400">({p.rating_count})</span></div>
        <div className="flex items-baseline gap-2"><b>{inr(price)}</b>{off > 0 && <s className="text-xs text-slate-400">{inr(p.price)}</s>}</div>
        <button className="btn mt-auto !py-2 text-sm" onClick={async () => setMsg((await addToCart(p.id)) ? "Added ✓" : "Failed")}>{msg || "Add to Cart"}</button>
      </div>
    </div>
  );
}
