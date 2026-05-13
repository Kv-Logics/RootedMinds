import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anvil Hackathon | Build Something Great",
  description: "24-hour hackathon project — Scaler School of Technology, Bengaluru",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark-900 text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
