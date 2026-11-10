import { notFound } from "next/navigation";
const P: Record<string, [string, string]> = {
  about: ["About Us", "Buyers is an Indian multi-vendor marketplace connecting shoppers with trusted sellers across electronics, fashion, home, beauty, books, sports and more. Shop with UPI, cards, net banking or cash on delivery."],
  contact: ["Contact Us", "Write to our support team using the email in the page footer. We reply within one business day."],
  help: ["Help Center", "Track orders and request returns from My Orders. Manage addresses from My Account. For anything else, contact support."],
  faqs: ["FAQs", "How do I track my order? Open My Orders. Can I cancel? Yes, until your order is packed. How do I return an item? Use the Return button on a delivered order, within the return window."],
  shipping: ["Shipping Information", "Standard delivery takes about 5 days and express about 2 days. Standard shipping is free on eligible order values; see checkout for the exact fee."],
  returns: ["Return Policy", "Easy returns within 7 days of delivery for eligible items. Refunds are processed to the original payment method after approval."],
  privacy: ["Privacy Policy", "We collect only the information needed to run your account and deliver orders, and we never sell personal data. Payments are processed by Razorpay; we do not store card details."],
  terms: ["Terms & Conditions", "By using Buyers you agree to provide accurate information and to use the marketplace lawfully. Sellers are responsible for their listings; prices and availability may change."],
};
export default function Info({ params }: { params: { page: string } }) {
  const p = P[params.page]; if (!p) notFound();
  return <div className="wrap" style={{ padding: "48px 20px", maxWidth: 760 }}><h2>{p[0]}</h2><p style={{ lineHeight: 1.8 }}>{p[1]}</p></div>;
}
