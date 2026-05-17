import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus — Operations Dashboard",
  description: "Real-time operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
