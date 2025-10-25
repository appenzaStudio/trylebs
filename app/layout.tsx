import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TryLebs.ai - جرب الملابس افتراضياً | Virtual Clothing Try-On",
  description: "جرب الملابس افتراضياً باستخدام الذكاء الاصطناعي - المنصة الرائدة للتجربة الافتراضية في الشرق الأوسط | Try on clothes virtually using AI",
  keywords: ["virtual try-on", "AI", "clothing", "fashion", "Middle East", "Lebanon", "تجربة افتراضية", "ذكاء اصطناعي", "ملابس", "موضة"],
  openGraph: {
    title: "TryLebs.ai - جرب الملابس افتراضياً",
    description: "جرب الملابس افتراضياً باستخدام الذكاء الاصطناعي",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased font-arabic">
        {children}
      </body>
    </html>
  );
}
