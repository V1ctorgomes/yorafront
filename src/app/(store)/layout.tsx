import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { StoreProviders } from "@/components/layout/StoreProviders";
import { fetchActiveCategories } from "@/lib/api/categories";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await fetchActiveCategories();

  return (
    <StoreProviders categories={categories}>
      <div className="flex min-h-full flex-col overflow-x-hidden">
        <Header categories={categories} />
        <main className="flex-1 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>
    </StoreProviders>
  );
}
