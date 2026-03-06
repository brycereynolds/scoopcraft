import type { Metadata } from "next";
import { Providers } from "./providers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoopCraft — Artisan Ice Cream Delivery",
  description:
    "Handcrafted happiness, delivered to your door. Custom ice cream orders, loyalty rewards, and more.",
  openGraph: {
    title: "ScoopCraft — Artisan Ice Cream Delivery",
    description:
      "Handcrafted happiness, delivered to your door. Custom ice cream orders, loyalty rewards, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
