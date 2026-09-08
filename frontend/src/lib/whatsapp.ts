export function normalizeNigerianNumber(phone?: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "234" + cleaned.substring(1);
  } else if (cleaned.startsWith("234") && cleaned.length === 13) {
    return cleaned;
  } else if (cleaned.length === 10) {
    cleaned = "234" + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppLink(phone?: string, message?: string): string {
  const number = normalizeNigerianNumber(phone);
  if (!number) return "";
  const text = encodeURIComponent(message || "Hello! I'm contacting you via D Tailors Marketplace.");
  return `https://wa.me/${number}?text=${text}`;
}

export function productWhatsAppMessage(productName: string, price: number, sellerName: string, link?: string): string {
  return `Hello! I'm interested in "${productName}" (₦${price.toLocaleString()}) from ${sellerName} on D Tailors Marketplace. ${link ? `\n\nView product: ${link}` : "Please let me know if it's available."}`;
}
