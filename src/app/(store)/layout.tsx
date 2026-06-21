import { Footer } from "@/components/layout/Footer";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <HeaderWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
