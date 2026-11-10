"use client";
import { useState } from "react";
import { sb } from "@/lib/supabase";
import { useStore } from "@/lib/store";
export default function ReviewForm({ productId }: { productId: string }) {
  const { user } = useStore(), [f, setF] = useState({ rating: "5", title: "", body: "" }), [m, setM] = useState("");
  if (!user) return <div className="card text-sm">Log in to write a review.</div>;
  const go = async (e: React.FormEvent) => { e.preventDefault(); const { error } = await sb.from("reviews").insert({ product_id: productId, user_id: user.id, rating: +f.rating, title: f.title, body: f.body }); setM(error ? "Could not post review: " + error.message : "Thanks! Your review was posted."); if (!error) setTimeout(() => location.reload(), 800); };
  return (<form onSubmit={go} className="card space-y-2"><b>Write a review</b>
    <select className="inp" value={f.rating} onChange={e => setF({ ...f, rating: e.target.value })}>{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{"★".repeat(n)}</option>)}</select>
    <input className="inp" placeholder="Title" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /><textarea className="inp" placeholder="Your review" value={f.body} onChange={e => setF({ ...f, body: e.target.value })} />
    <button className="bt">Post review</button><p className="text-sm">{m}</p></form>);
}
