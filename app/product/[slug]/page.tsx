import { notFound } from "next/navigation";
import { sb, PRODUCT_SELECT, inr } from "@/lib/supabase";
import Card from "@/components/Card";
import AddButtons from "./AddButtons";
import ReviewForm from "./ReviewForm";
export const dynamic = "force-dynamic";
export default async function Product({ params }: { params: { slug: string } }) {
  const { data: p } = await sb.from("products").select(PRODUCT_SELECT + ",specifications").eq("slug", params.slug).maybeSingle();
  if (!p) notFound();
  const [{ data: reviews }, { data: related }, { data: ds }] = await Promise.all([
    sb.from("reviews").select("rating,title,body,created_at").eq("product_id", p.id).order("created_at", { ascending: false }).limit(20),
    sb.from("products").select(PRODUCT_SELECT).eq("category_id", p.category_id).neq("id", p.id).limit(4),
    sb.from("platform_settings").select("value").eq("key", "delivery").single()]);
  const price = Number(p.discount_price ?? p.price), stock = p.inventory?.reduce((a: number, i: any) => a + i.quantity, 0) ?? 0, off = Math.round((1 - price / p.price) * 100);
  const imgs = [...p.product_images].sort((a: any, b: any) => a.sort_order - b.sort_order), d = ds?.value || {};
  const eta = new Date(Date.now() + (d.standard_days || 5) * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="wrap" style={{ padding: "32px 20px" }}>
      <div className="dg gap-8 md:grid-cols-2">
        <div className="space-y-2"><img src={imgs[0]?.url} alt={p.name} className="w-full rounded-2xl bg-slate-100" /><div className="flex gap-2">{imgs.slice(1).map((i: any) => <img key={i.url} src={i.url} className="h-20 w-20 rounded-lg object-cover" alt="" />)}</div></div>
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase text-brand">{p.categories?.name}{p.brand ? ` · ${p.brand}` : ""}</p>
          <h1 className="text-3xl font-extrabold">{p.name}</h1>
          <p className="text-brand">★ {Number(p.rating_avg).toFixed(1)} <span className="text-slate-400">({p.rating_count} reviews)</span></p>
          <p className="text-3xl font-bold">{inr(price)} {off > 0 && <><s className="text-base font-normal text-slate-400">{inr(p.price)}</s> <span className="text-base text-green-600">{off}% off</span></>}</p>
          <p className="text-slate-600">{p.description}</p>
          <p className={stock > 0 ? "font-semibold text-green-600" : "font-semibold text-red-600"}>{stock > 0 ? (stock < 10 ? `Only ${stock} left` : "In stock") : "Out of stock"}</p>
          <p className="text-sm">🚚 Get it by <b>{eta}</b> · {price >= (d.free_shipping_above ?? 499) ? "Free delivery" : `Delivery ${inr(d.standard_fee ?? 49)}`}{d.cod_enabled ? " · Cash on Delivery available" : ""}</p>
          {stock > 0 && <AddButtons id={p.id} />}
          {p.specifications && Object.keys(p.specifications).length > 0 && <div className="card text-sm">{Object.entries(p.specifications).map(([k, v]) => <div key={k} className="flex justify-between border-b py-1"><span className="text-slate-500">{k}</span><span>{String(v)}</span></div>)}</div>}
        </div>
      </div>
      <h2 style={{ marginTop: 40 }}>Ratings &amp; Reviews</h2>
      <div className="dg gap-6 md:grid-cols-2"><div>{reviews?.length ? reviews.map((r, i) => <div key={i} className="card mb-2 text-sm"><b className="text-brand">{"★".repeat(r.rating)}</b> <b>{r.title}</b><p className="text-slate-600">{r.body}</p></div>) : <p className="text-slate-500">No reviews yet. Be the first!</p>}</div><ReviewForm productId={p.id} /></div>
      {!!related?.length && <><h2 style={{ marginTop: 40 }}>You may also like</h2><div className="grid">{related.map(r => <Card key={r.id} p={r} />)}</div></>}
    </div>
  );
}
