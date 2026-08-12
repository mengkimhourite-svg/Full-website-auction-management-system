import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import Providers from "@/components/layout/Providers";

export const metadata = {
  title: "AuctionPro - Online Auction Platform",
  description: "Discover rare items and bid online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
