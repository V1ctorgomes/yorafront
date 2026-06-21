import { Footer } from "@/components/layout/Footer";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { StoreProviders } from "@/components/layout/StoreProviders";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProviders>
      <div className="flex min-h-full flex-col">
        <HeaderWrapper />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </StoreProviders>
  );
}
