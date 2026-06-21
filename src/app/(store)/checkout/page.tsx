import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <SectionTitle
        title="Checkout"
        subtitle="A finalização do pedido será implementada no próximo módulo."
      />
      <div className="mt-10 border border-dashed border-yora-charcoal/15 bg-yora-cream px-6 py-12 text-center">
        <p className="text-sm text-yora-muted">
          Você chegou à próxima etapa do fluxo de compra. Em breve será possível
          concluir o pedido por aqui.
        </p>
        <Button href="/carrinho" variant="ghost" className="mt-6">
          Voltar ao carrinho
        </Button>
      </div>
    </div>
  );
}
