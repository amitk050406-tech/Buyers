"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sb, PRODUCT_SELECT } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import Card from "@/components/Card";
export default function Wishlist() {
  const { wish, user } = useStore(), [items, setItems] = useState<any[] | null>(null);
  useEffect(() => { sb.from("wishlist_items").select(`products(${PRODUCT_SELECT})`).order("created_at", { ascending: false }).then(({ data }) => setItems((data || []).map((x: any) => x.products).filter(Boolean))); }, [wish.size]);
  return (<div className="wrap" style={{ padding: "32px 20px" }}><h2>My Wishlist</h2>
    {!user ? <p className="empty"><Link href="/login" className="text-brand">Log in</Link> to see your wishlist.</p> : !items ? <p className="empty">Loading…</p> : !items.length ? <p className="empty">Nothing saved yet. Tap ♡ on any product.</p> : <div className="grid">{items.map(p => <Card key={p.id} p={p} />)}</div>}</div>);
}
