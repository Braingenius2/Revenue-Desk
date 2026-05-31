import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Revenue Desk",
  description: "Business management for local companies",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "RevDesk",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/images/logo/logo-icon.svg",
    apple: "/images/logo/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body suppressHydrationWarning={true}>
        <PwaRegister />
        <Providers>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}