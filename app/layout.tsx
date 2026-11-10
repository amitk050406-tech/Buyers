import "./globals.css";
import "./original.css";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata = { title: "Buyers – Everything You Love, Just One Click Away", description: "Discover amazing products, exclusive deals and a smarter shopping experience with Buyers." };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><StoreProvider>
    <div className="ann">Welcome to <b>Buyers</b> | Discover Amazing Products &amp; Exclusive Deals!</div>
    <Header />{children}<Footer /></StoreProvider></body></html>);
}
