import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSN Communication & MeeSeva Services Portal",
  description:
    "MSN Communication & MeeSeva Services Portal — Instant government service applications, document management, and online works. Fast, secure, and certified.",
  keywords: ["MeeSeva", "government services", "MSN", "online works", "document management"],
  icons: {
    icon: "/msn-logo.png",
    shortcut: "/favicon.ico",
    apple: "/msn-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/msn-logo.png" />
        <link rel="apple-touch-icon" href="/msn-logo.png" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
