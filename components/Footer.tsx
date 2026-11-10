import Link from "next/link";
import { sb } from "@/lib/supabase";
export default async function Footer() {
  const { data } = await sb.from("platform_settings").select("value").eq("key", "marketplace").single();
  const email = data?.value?.support_email, phone = process.env.NEXT_PUBLIC_CONTACT_PHONE, addr = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  return (
    <footer><div className="wrap">
      <div className="fg">
        <div><span className="logo" role="img" aria-label="Buyers logo" /><p style={{ fontSize: ".92rem", margin: 0 }}>Buyers is an Indian online marketplace – shop smarter, discover more.</p>
          <div className="soc"><a href="#" aria-label="Instagram">in</a><a href="#" aria-label="X">X</a><a href="#" aria-label="Facebook">f</a><a href="#" aria-label="YouTube">▶</a></div></div>
        <div><h4>Quick Links</h4><ul><li><Link href="/">Home</Link></li><li><Link href="/shop">Shop</Link></li><li><Link href="/info/about">About Us</Link></li><li><Link href="/info/contact">Contact Us</Link></li></ul></div>
        <div><h4>Customer Service</h4><ul><li><Link href="/info/help">Help Center</Link></li><li><Link href="/info/faqs">FAQs</Link></li><li><Link href="/info/shipping">Shipping Information</Link></li><li><Link href="/info/returns">Return Policy</Link></li><li><Link href="/info/privacy">Privacy Policy</Link></li><li><Link href="/info/terms">Terms &amp; Conditions</Link></li></ul></div>
        <div id="contact"><h4>Contact</h4><ul>{email && <li>Email: {email}</li>}{phone && <li>Phone: {phone}</li>}{addr && <li>Address: {addr}</li>}</ul></div>
      </div>
      <div className="fb"><span>© 2026 Buyers. All rights reserved.</span><span>Payments: UPI · Cards · Net Banking · Cash on Delivery</span></div>
    </div></footer>
  );
}
