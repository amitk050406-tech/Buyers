import { createClient } from "@supabase/supabase-js";
export const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
export const PRODUCT_SELECT = "id,category_id,slug,name,brand,description,price,discount_price,rating_avg,rating_count,is_featured,product_images(url,sort_order),inventory(quantity),categories(name,slug)";
export async function addToCart(productId: string, qty = 1) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { location.href = "/login"; return false; }
  const { data: cart } = await sb.from("carts").select("id").eq("user_id", user.id).single();
  const { data: ex } = await sb.from("cart_items").select("id,quantity").eq("cart_id", cart!.id).eq("product_id", productId).is("variant_id", null).maybeSingle();
  const r = ex ? await sb.from("cart_items").update({ quantity: Math.min(20, ex.quantity + qty) }).eq("id", ex.id)
                : await sb.from("cart_items").insert({ cart_id: cart!.id, product_id: productId, quantity: qty });
  window.dispatchEvent(new Event("cart-changed"));
  return !r.error;
}
