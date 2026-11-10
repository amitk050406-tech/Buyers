"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sb, inr } from "@/lib/supabase";
import { useStore } from "@/lib/store";
export default function Header() {
  const { user, role, cart, wish } = useStore();
  const [open, setOpen] = useState(false), [mega, setMega] = useState(false), [sbar, setSbar] = useState(false), [q, setQ] = useState(""), [res, setRes] = useState<any[]>([]), [cats, setCats] = useState<any[]>([]), [menu, setMenu] = useState(false);
  useEffect(() => { sb.from("categories").select("name,slug").is("parent_id", null).eq("is_active", true).order("sort_order").then(({ data }) => setCats(data || [])); }, []);
  useEffect(() => { const t = setTimeout(async () => { if (q.trim().length < 2) return setRes([]); const { data } = await sb.from("products").select("slug,name,price,discount_price,product_images(url,sort_order)").ilike("name", `%${q.replace(/[%,]/g, "")}%`).limit(6); setRes(data || []); }, 250); return () => clearTimeout(t); }, [q]);
  const go = () => { setOpen(false); setMega(false); setMenu(false); };
  return (
    <header>
      <div className="wrap">
        <div className="nav">
          <Link href="/" aria-label="Buyers home" style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="logo" role="img" aria-label="Buyers logo" /></Link>
          <nav className={`links ${open ? "open" : ""}`} aria-label="Main" onClick={e => (e.target as HTMLElement).closest("a") && go()}>
            <Link href="/">Home</Link><Link href="/shop">Shop</Link>
            <div className={`has ${mega ? "mo" : ""}`} style={{ padding: 0 }}>
              <button style={{ padding: "10px 14px", fontWeight: 600, fontSize: ".95rem", borderRadius: 10 }} aria-haspopup="true" onClick={() => setMega(!mega)}>Categories ▾</button>
              <div className={`mega ${mega ? "open" : ""}`}>{cats.map(c => <Link key={c.slug} href={`/shop?category=${c.slug}`} style={{ padding: 10, borderRadius: 10, fontWeight: 600, fontSize: ".9rem" }}>{c.name}</Link>)}</div>
            </div>
            <Link href="/shop?deals=1">Deals &amp; Offers</Link><Link href="/#new">New Arrivals</Link><Link href="/info/about">About Us</Link>
          </nav>
          <div className="acts">
            <button className="ib" aria-label="Search" onClick={() => setSbar(!sbar)}>🔍</button>
            <div style={{ position: "relative" }}>
              <button className="ib" aria-label="Account" onClick={() => user ? setMenu(!menu) : (location.href = "/login")}>👤</button>
              {menu && user && <div className="sres" style={{ position: "absolute", right: 0, top: 48, width: 200, zIndex: 70 }} onClick={go}>
                <div style={{ padding: "10px 14px", fontSize: ".8rem", color: "var(--mut)" }}>{user.email}</div>
                <Link href="/account" className="sbtn" style={{ display: "block", padding: "10px 14px" }}>My Account</Link><Link href="/orders" style={{ display: "block", padding: "10px 14px" }}>My Orders</Link>
                {(role === "seller" || role === "admin") && <Link href="/seller" style={{ display: "block", padding: "10px 14px" }}>Seller Hub</Link>}{role === "admin" && <Link href="/admin" style={{ display: "block", padding: "10px 14px" }}>Admin</Link>}
                <button style={{ padding: "10px 14px", width: "100%", textAlign: "left", color: "#c0392b" }} onClick={async () => { await sb.auth.signOut(); location.href = "/"; }}>Log out</button></div>}
            </div>
            <Link href="/wishlist" className="ib" aria-label="Wishlist">♡<span className="badge">{wish.size}</span></Link>
            <Link href="/cart" className="ib" aria-label="Cart">🛒<span className="badge">{cart}</span></Link>
            <button className="ib burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
          </div>
        </div>
        <div className={`sbar ${sbar ? "open" : ""}`}>
          <form onSubmit={e => { e.preventDefault(); location.href = `/shop?q=${encodeURIComponent(q)}`; }}><input type="search" placeholder="Search products, e.g. headphones, kurta…" aria-label="Search products" autoComplete="off" value={q} onChange={e => setQ(e.target.value)} /></form>
          {q.trim().length > 1 && <div className="sres">{res.length ? res.map(p => <Link key={p.slug} href={`/product/${p.slug}`} onClick={() => { setQ(""); setSbar(false); }} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px" }}><img src={[...p.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} /><span style={{ flex: 1 }}>{p.name}</span><b>{inr(p.discount_price ?? p.price)}</b></Link>) : <p className="empty" style={{ padding: 20 }}>No products match “{q.replace(/[<>&]/g, "")}”.</p>}</div>}
        </div>
      </div>
    </header>
  );
}
