import { sb, PRODUCT_SELECT } from "@/lib/supabase";
import Landing from "@/components/Landing";
export const revalidate = 60;
export default async function Home() {
  const [{ data: all }, { data: fresh }, { data: onSale }] = await Promise.all([
    sb.from("products").select(PRODUCT_SELECT).order("is_featured", { ascending: false }).order("sold_count", { ascending: false }).limit(48),
    sb.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }).limit(8),
    sb.from("products").select(PRODUCT_SELECT).not("discount_price", "is", null).limit(30)]);
  const deals = (onSale || []).sort((a, b) => (1 - b.discount_price / b.price) - (1 - a.discount_price / a.price)).slice(0, 3);
  return <Landing products={all || []} deals={deals} fresh={fresh || []} />;
}
