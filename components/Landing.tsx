"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import { sb, inr } from "@/lib/supabase";
export const TILES = [["Electronics", "📱", "Gadgets & audio", "#1e3a8a,#3b82f6", "electronics"], ["Fashion & Clothing", "👕", "Style for every day", "#9d174d,#f472b6", "fashion"], ["Home & Kitchen", "🍳", "Make home yours", "#92400e,#fbbf24", "home-kitchen"], ["Beauty & Personal Care", "💄", "Glow your way", "#6b21a8,#c084fc", "beauty-personal-care"], ["Books & Stationery", "📚", "Read, write, create", "#065f46,#34d399", "books-stationery"], ["Sports & Fitness", "🏏", "Move more", "#991b1b,#f87171", "sports-fitness"], ["Accessories", "⌚", "Finish the look", "#155e75,#22d3ee", "mobiles-accessories"], ["Lifestyle Products", "🪴", "Live better", "#3f6212,#a3e635", "other"]];
const IDX: Record<string, number> = { electronics: 0, fashion: 1, "mens-fashion": 1, "womens-fashion": 1, "home-kitchen": 2, "beauty-personal-care": 3, "books-stationery": 4, "sports-fitness": 5, "mobiles-accessories": 6, other: 7, "grocery-essentials": 7, "toys-games": 7 };
const R = [["Aarav S.", "Smooth browsing and a clean cart experience.", 5], ["Priya M.", "Love how easy it is to find things quickly.", 5], ["Rohan K.", "The wishlist feature is handy for planning purchases.", 4], ["Neha D.", "Great layout on my phone – everything is easy to tap.", 5], ["Vikram T.", "Nice deals section, very clear pricing.", 4]];
const disc = (p: any) => Math.round((1 - Number(p.discount_price ?? p.price) / p.price) * 100);
export default function Landing({ products, deals, fresh }: { products: any[]; deals: any[]; fresh: any[] }) {
  const [f, setF] = useState(-1), [t, setT] = useState(["00", "00", "00"]), [em, setEm] = useState(""), [nm, setNm] = useState("");
  const nt = useRef<HTMLDivElement>(null), rt = useRef<HTMLDivElement>(null);
  useEffect(() => { const tick = () => { const L = 6 * 3600e3, r = L - (Date.now() % L); setT([Math.floor(r / 36e5), Math.floor(r % 36e5 / 6e4), Math.floor(r % 6e4 / 1e3)].map(v => String(v).padStart(2, "0"))); }; tick(); const i = setInterval(tick, 1000); return () => clearInterval(i); }, []);
  const list = products.filter(p => f < 0 || IDX[p.categories?.slug] === f).slice(0, f < 0 ? 8 : 99);
  const scroll = (el: HTMLDivElement | null, n: number) => el?.scrollBy({ left: n * ((el.firstElementChild as HTMLElement).offsetWidth + 16), behavior: "smooth" });
  const sub = async (e: React.FormEvent) => { e.preventDefault(); const v = em.trim().toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setNm("⚠ Please enter a valid email address.");
    const { error } = await sb.from("newsletter_subscribers").insert({ email: v }); setNm(error && error.code !== "23505" ? "⚠ Something went wrong. Try again." : "✓ Thanks for subscribing!"); if (!error) setEm(""); };
  return (
    <main id="home">
      <div className="hero"><div className="wrap hg">
        <div><h1>Everything You Love, <em>Just One Click Away.</em></h1>
          <p>Discover amazing products, explore exciting deals, and enjoy a smarter shopping experience with Buyers.</p>
          <div className="ctas"><Link className="btn p" href="/shop">Start Shopping →</Link><a className="btn s" href="#categories">Explore Collections</a></div></div>
        <div className="stage" aria-hidden="true"><div className="orb">🛍️</div>
          <div className="chip a">✨ New Arrivals</div><div className="chip b">🔥 Exclusive Deals</div><div className="chip c">📈 Trending Products</div>
          <span className="fe" style={{ top: "-2%", right: "18%" }}>🎧</span><span className="fe" style={{ bottom: "18%", right: "-2%", animationDelay: "-2s" }}>👟</span><span className="fe" style={{ bottom: "-2%", left: "42%", animationDelay: "-3s" }}>⌚</span></div>
      </div></div>
      <section id="categories"><div className="wrap"><h2>Shop by Category</h2><p className="sub">Eight worlds of products, one marketplace.</p>
        <div className="cats">{TILES.map(c => <Link key={c[4]} className="cat" href={`/shop?category=${c[4]}`}><div className="im" style={{ background: `linear-gradient(135deg,${c[3].split(",")[0]},${c[3].split(",")[1]})` }}>{c[1]}</div><div className="t"><b>{c[0]}</b><small>{c[2]}</small><span className="ex">Explore →</span></div></Link>)}</div></div></section>
      <section id="shop" style={{ paddingTop: 0 }}><div className="wrap"><h2>Discover Our Featured Products</h2><p className="sub">Handpicked favourites across every category.</p>
        <div className="chips">{["All", ...TILES.map(c => c[0])].map((n, i) => <button key={n} className={`fc ${i - 1 === f ? "on" : ""}`} onClick={() => setF(i - 1)}>{n}</button>)}</div>
        <div className="grid">{list.length ? list.map(p => <Card key={p.id} p={p} />) : <p className="empty">No products here yet.</p>}</div>
        <div style={{ textAlign: "center", marginTop: 28 }}><Link className="btn p" href="/shop">View all products</Link></div></div></section>
      <section id="deals" style={{ paddingTop: 0 }}><div className="wrap"><div className="deals">
        <div><h2>Big Deals. Bigger Savings.</h2><p style={{ opacity: .85, margin: 0 }}>Limited-time offers on trending picks.</p>
          <div className="cd" aria-live="off">{["HOURS", "MINS", "SECS"].map((l, i) => <div key={l}><b>{t[i]}</b><small>{l}</small></div>)}</div>
          <p style={{ fontSize: ".78rem", opacity: .7, margin: "0 0 18px" }}>Deals refresh every 6 hours.</p>
          <Link className="btn p" href="/shop?deals=1">Grab the Deal</Link></div>
        <div className="dl">{deals.map(p => <div key={p.id}><Link href={`/product/${p.slug}`}>{p.name} · {inr(p.discount_price)}</Link><b>{disc(p)}% OFF</b></div>)}<div><span>🚚 Free shipping above ₹499</span><b>Offer</b></div></div>
      </div></div></section>
      <section id="about" style={{ paddingTop: 0 }}><div className="wrap"><h2>Why Shop with Buyers?</h2><p className="sub">Built around a simple, convenient experience.</p>
        <div className="why">{[["🛒", "Easy Shopping", "Enjoy a simple and convenient shopping experience."], ["🔒", "Secure Payments", "UPI, cards and net banking, verified on our servers."], ["⭐", "Quality Products", "Discover products across multiple categories."], ["💬", "Customer Support", "Get assistance whenever you need help."]].map(w => <div className="wc" key={w[1]}><i>{w[0]}</i><h3>{w[1]}</h3><p>{w[2]}</p></div>)}</div></div></section>
      <section id="new" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="ch"><div><h2>Fresh Finds, Just Arrived!</h2><p className="sub">Newly added products.</p></div><div className="ar"><button aria-label="Previous" onClick={() => scroll(nt.current, -1)}>‹</button><button aria-label="Next" onClick={() => scroll(nt.current, 1)}>›</button></div></div>
        <div className="track" ref={nt}>{fresh.map(p => <Card key={p.id} p={p} />)}</div></div></section>
      <section style={{ paddingTop: 0 }}><div className="wrap"><div className="banner">
        <div><h2>Your Next Favourite Product Is Waiting.</h2><p>Explore a world of possibilities with Buyers. Shop smarter, discover more, and enjoy every purchase.</p><Link className="btn p" href="/shop">Explore Buyers</Link></div>
        <div className="bn" aria-hidden="true">🎁</div></div></div></section>
      <section style={{ paddingTop: 0 }}><div className="wrap">
        <div className="ch"><div><h2>What Shoppers Say</h2><p className="sub">Words from our community.</p></div><div className="ar"><button aria-label="Previous review" onClick={() => scroll(rt.current, -1)}>‹</button><button aria-label="Next review" onClick={() => scroll(rt.current, 1)}>›</button></div></div>
        <div className="track" ref={rt}>{R.map(r => <div className="rv" key={r[0] as string}><div className="st">{"★".repeat(r[2] as number)}{"☆".repeat(5 - (r[2] as number))}</div><p>“{r[1]}”</p><div className="av"><i>{(r[0] as string)[0]}</i><div><b>{r[0]}</b></div></div></div>)}</div></div></section>
      <section style={{ paddingTop: 0 }}><div className="wrap"><div className="nl">
        <h2>Stay Ahead. Shop Smarter.</h2><p>Subscribe to receive updates about new arrivals, exclusive offers, and exciting deals.</p>
        <form className="nf" onSubmit={sub} noValidate><input className="in" type="email" placeholder="you@example.com" aria-label="Email address" value={em} onChange={e => setEm(e.target.value)} /><button className="btn" type="submit">Subscribe</button></form>
        <div id="nm" role="status">{nm}</div></div></div></section>
    </main>
  );
}
