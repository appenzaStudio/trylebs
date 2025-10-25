import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TryLebs.ai - Virtual Clothing Try-On",
  description: "Try on clothes virtually using AI - The leading virtual try-on platform for the Middle East",
  keywords: ["virtual try-on", "AI", "clothing", "fashion", "Middle East", "Lebanon"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
