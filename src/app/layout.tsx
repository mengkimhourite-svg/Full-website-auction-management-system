import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";

export const metadata = {
  title: "AuctionPro - Online Auction Platform",
  description: "Discover rare items and bid online.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
