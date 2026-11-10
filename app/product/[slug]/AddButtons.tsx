"use client";
import { addToCart } from "@/lib/supabase";
import { useStore } from "@/lib/store";
export default function AddButtons({ id }: { id: string }) {
  const { toast, wish, toggleWish } = useStore();
  return (<div className="flex flex-wrap items-center gap-3">
    <button className="bt" onClick={async () => toast((await addToCart(id)) ? "Added to cart" : "Could not add")}>Add to Cart</button>
    <button className="bt !bg-navy" onClick={async () => { if (await addToCart(id)) location.href = "/checkout"; }}>Buy Now</button>
    <button className="bt !bg-white !text-slate-700 border" onClick={() => toggleWish(id)}>{wish.has(id) ? "♥ Wishlisted" : "♡ Wishlist"}</button></div>);
}
