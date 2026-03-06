import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoopcraft — Artisan Ice Cream Delivery",
  description: "Handcrafted happiness, delivered to your door. Custom ice cream orders, loyalty rewards, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
