import type { Metadata, Viewport } from "next";
import { Syne, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { ProductsProvider } from "@/context/products-context";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";
import { CartDrawer } from "@/components/cart-drawer";
import { LoginModal } from "@/components/login-modal";
import { Footer } from "@/components/footer";
import { listActiveProducts } from "@/db/products-repo";

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BEINGASELLER — Loud Fits, Zero Drama",
    template: "%s · BEINGASELLER",
  },
  description:
    "Gen-Z streetwear hand-picked and rated 4.5+ or it never drops. 100% prepaid, shipped across India. No COD. No returns. No cap.",
  keywords: [
    "streetwear india",
    "oversized tees",
    "gen z fashion",
    "beingaseller",
    "hoodies",
    "cargos",
  ],
  openGraph: {
    title: "BEINGASELLER — Loud Fits, Zero Drama",
    description:
      "Streetwear rated 4.5+ or it never drops. Prepaid only. Ships across India.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06060b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetched once per request so the cart/checkout have product data
  // available immediately instead of waiting on a client-side fetch.
  const initialProducts = await listActiveProducts().catch(() => []);

  return (
    <html lang="en" className={`${syne.variable} ${grotesk.variable}`}>
      <body className="noise min-h-screen bg-void font-sans text-white antialiased">
        <ProductsProvider initialProducts={initialProducts}>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <LoginModal />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
