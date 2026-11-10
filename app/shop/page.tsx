import Link from "next/link";
import { sb, PRODUCT_SELECT } from "@/lib/supabase";
import Card from "@/components/Card";
export const dynamic = "force-dynamic";
type SP = { q?: string; category?: string; sort?: string; min?: string; max?: string; rating?: string; deals?: string; page?: string };
export default async function Shop({ searchParams: s }: { searchParams: SP }) {
  const page = Math.max(1, parseInt(s.page || "1") || 1), size = 12, num = (v?: string) => (v && isFinite(+v) && +v >= 0 ? +v : null);
  const { data: cats } = await sb.from("categories").select("id,name,slug,parent_id").eq("is_active", true).order("sort_order");
  const cat = cats?.find(c => c.slug === s.category);
  let q = sb.from("products").select(PRODUCT_SELECT, { count: "exact" });
  if (cat) q = q.in("category_id", [cat.id, ...(cats || []).filter(c => c.parent_id === cat.id).map(c => c.id)]);
  if (s.q) q = q.ilike("name", `%${s.q.replace(/[%,()]/g, "")}%`);
  if (s.deals) q = q.not("discount_price", "is", null);
  if (s.rating) q = q.gte("rating_avg", num(s.rating) ?? 0);
  const min = num(s.min), max = num(s.max);
  if (min !== null || max !== null) { const lo = min ?? 0, hi = max ?? 99999999; q = q.or(`and(discount_price.gte.${lo},discount_price.lte.${hi}),and(discount_price.is.null,price.gte.${lo},price.lte.${hi})`); }
  q = s.sort === "price_asc" ? q.order("price") : s.sort === "price_desc" ? q.order("price", { ascending: false }) : s.sort === "rating" ? q.order("rating_avg", { ascending: false }) : s.sort === "popular" ? q.order("sold_count", { ascending: false }) : q.order("created_at", { ascending: false });
  const { data: products, count } = await q.range((page - 1) * size, page * size - 1);
  const pages = Math.ceil((count || 0) / size), href = (o: Partial<SP>) => `/shop?${new URLSearchParams(Object.entries({ ...s, ...o }).filter(([, v]) => v) as any)}`;
  return (
    <div className="wrap" style={{ padding: "32px 20px" }}>
      <h2>{cat?.name || (s.deals ? "Deals & Offers" : s.q ? `Results for “${s.q}”` : "All Products")}</h2><p className="sub">{count || 0} products</p>
      <div className="chips"><Link className={`fc ${!cat ? "on" : ""}`} href="/shop">All</Link>{cats?.filter(c => !c.parent_id).map(c => <Link key={c.slug} className={`fc ${c.slug === s.category ? "on" : ""}`} href={href({ category: c.slug, page: undefined })}>{c.name}</Link>)}</div>
      <form className="chips" style={{ alignItems: "center" }}>
        {s.category && <input type="hidden" name="category" value={s.category} />}{s.q && <input type="hidden" name="q" value={s.q} />}{s.deals && <input type="hidden" name="deals" value="1" />}
        <input className="in" style={{ width: 100 }} name="min" type="number" placeholder="Min ₹" defaultValue={s.min} /><input className="in" style={{ width: 100 }} name="max" type="number" placeholder="Max ₹" defaultValue={s.max} />
        <select className="in" style={{ width: 130 }} name="rating" defaultValue={s.rating || ""}><option value="">Any rating</option><option value="4">4★ &amp; up</option><option value="3">3★ &amp; up</option></select>
        <select className="in" style={{ width: 150 }} name="sort" defaultValue={s.sort || ""}><option value="">Newest</option><option value="popular">Popularity</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Top rated</option></select>
        <button className="btn p" style={{ padding: "10px 20px" }}>Apply</button></form>
      {products?.length ? <div className="grid">{products.map(p => <Card key={p.id} p={p} />)}</div> : <p className="empty">No products found. Try changing the filters.</p>}
      {pages > 1 && <div className="chips" style={{ justifyContent: "center", marginTop: 28 }}>{Array.from({ length: pages }, (_, i) => <Link key={i} className={`fc ${i + 1 === page ? "on" : ""}`} href={href({ page: String(i + 1) })}>{i + 1}</Link>)}</div>}
    </div>
  );
}
