"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { sb } from "./supabase";
type S = { user: any; role: string; cart: number; wish: Set<string>; refresh: () => void; toggleWish: (id: string) => void; toast: (m: string) => void };
const Ctx = createContext<S>(null as any);
export const useStore = () => useContext(Ctx);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null), [role, setRole] = useState(""), [cart, setCart] = useState(0), [wish, setWish] = useState<Set<string>>(new Set()), [toasts, setToasts] = useState<string[]>([]);
  const refresh = useCallback(async () => {
    const { data: { user } } = await sb.auth.getUser(); setUser(user);
    if (!user) { setCart(0); setWish(new Set()); setRole(""); return; }
    const [c, w, u] = await Promise.all([sb.from("cart_items").select("quantity").eq("saved_for_later", false), sb.from("wishlist_items").select("product_id"), sb.from("users").select("role").eq("id", user.id).single()]);
    setCart((c.data || []).reduce((a, b) => a + b.quantity, 0)); setWish(new Set((w.data || []).map(x => x.product_id))); setRole(u.data?.role || "customer");
  }, []);
  useEffect(() => { refresh(); const { data: s } = sb.auth.onAuthStateChange(() => refresh()); window.addEventListener("cart-changed", refresh); return () => { s.subscription.unsubscribe(); window.removeEventListener("cart-changed", refresh); }; }, [refresh]);
  const toast = (m: string) => { setToasts(t => [...t, m]); setTimeout(() => setToasts(t => t.slice(1)), 2600); };
  const toggleWish = async (id: string) => {
    if (!user) { location.href = "/login"; return; }
    const { data: wl } = await sb.from("wishlists").select("id").eq("user_id", user.id).single();
    if (wish.has(id)) { await sb.from("wishlist_items").delete().eq("wishlist_id", wl!.id).eq("product_id", id); toast("Removed from wishlist"); }
    else { await sb.from("wishlist_items").insert({ wishlist_id: wl!.id, product_id: id }); toast("Saved to wishlist"); }
    refresh();
  };
  return <Ctx.Provider value={{ user, role, cart, wish, refresh, toggleWish, toast }}>{children}<div id="toasts">{toasts.map((t, i) => <div key={i} className="ts">{t}</div>)}</div></Ctx.Provider>;
}
