"use client";
import Link from "next/link";
import { addToCart, inr } from "@/lib/supabase";
import { useStore } from "@/lib/store";
const G = ["#1e3a8a,#3b82f6", "#9d174d,#f472b6", "#92400e,#fbbf24", "#6b21a8,#c084fc", "#065f46,#34d399", "#991b1b,#f87171"];
export default function Card({ p }: { p: any }) {
  const { wish, toggleWish, toast } = useStore();
  const price = Number(p.discount_price ?? p.price), off = Math.round((1 - price / p.price) * 100), on = wish.has(p.id);
  const img = [...(p.product_images || [])].sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url;
  const g = G[p.name.length % G.length].split(",");
  const stock = (p.inventory || []).reduce((a: number, i: any) => a + i.quantity, 0);
  return (
    <article className="pc">
      <div className="pi" style={{ background: `linear-gradient(135deg,${g[0]}22,${g[1]}55)` }}>
        <Link href={`/product/${p.slug}`} style={{ position: "absolute", inset: 0 }}>{img && <img src={img} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</Link>
        {off > 0 && <span className="off">{off}% OFF</span>}
        <button className={`wb ${on ? "on" : ""}`} aria-label={`Toggle wishlist for ${p.name}`} onClick={() => toggleWish(p.id)}>{on ? "♥" : "♡"}</button>
        <Link href={`/product/${p.slug}`} className="qv" style={{ textAlign: "center" }}>Quick View</Link>
      </div>
      <div className="pb">
        <h3><Link href={`/product/${p.slug}`}>{p.name}</Link></h3>
        <div className="st">{"★".repeat(Math.round(p.rating_avg || 0))}{"☆".repeat(5 - Math.round(p.rating_avg || 0))} <span className="demo">({p.rating_count})</span></div>
        <div className="pr"><b>{inr(price)}</b>{off > 0 && <s>{inr(p.price)}</s>}</div>
        {stock > 0 ? <button className="btn p" onClick={async () => toast((await addToCart(p.id)) ? "Added to cart: " + p.name : "Could not add to cart")}>Add to Cart</button> : <button className="btn p" disabled style={{ opacity: .5 }}>Out of stock</button>}
      </div>
    </article>
  );
}
