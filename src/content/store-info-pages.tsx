import type { ReactNode } from "react";

export interface StoreInfoPageContent {
  title: string;
  subtitle?: string;
  sections: Array<{ title: string; content: ReactNode }>;
}

export const storeInfoPages = {
  privacidade: {
    title: "Política de privacidade",
    subtitle:
      "Como a YORA coleta, utiliza e protege seus dados pessoais em conformidade com a LGPD.",
    sections: [
      {
        title: "Dados coletados",
        content: (
          <>
            <p>
              Coletamos nome, CPF, e-mail, telefone, endereço e histórico de
              pedidos para processar compras, entregas e atendimento.
            </p>
            <p>
              Dados de pagamento são processados por provedores certificados e
              não armazenamos números completos de cartão.
            </p>
          </>
        ),
      },
      {
        title: "Uso das informações",
        content: (
          <p>
            Utilizamos seus dados para confirmar pedidos, emitir notas e
            etiquetas de envio, prestar suporte e cumprir obrigações legais.
            Não vendemos seus dados a terceiros.
          </p>
        ),
      },
      {
        title: "Seus direitos",
        content: (
          <p>
            Você pode solicitar acesso, correção ou exclusão de dados pelo
            e-mail{" "}
            <a
              href="mailto:contato@yora.com.br"
              className="text-yora-charcoal underline underline-offset-4"
            >
              contato@yora.com.br
            </a>
            .
          </p>
        ),
      },
    ],
  },
  termos: {
    title: "Termos de uso",
    subtitle: "Condições gerais para navegação e compras no site da YORA.",
    sections: [
      {
        title: "Conta e cadastro",
        content: (
          <p>
            Ao criar uma conta ou finalizar uma compra, você declara que as
            informações fornecidas são verdadeiras e se responsabiliza pelo uso
            das credenciais de acesso.
          </p>
        ),
      },
      {
        title: "Pedidos e pagamentos",
        content: (
          <p>
            O pedido é confirmado após aprovação do pagamento. Preços, estoque e
            prazos de entrega podem ser atualizados antes da conclusão da
            compra.
          </p>
        ),
      },
      {
        title: "Propriedade intelectual",
        content: (
          <p>
            Marcas, imagens e conteúdos do site são de propriedade da YORA ou
            licenciados. É proibida a reprodução sem autorização prévia.
          </p>
        ),
      },
    ],
  },
  ajuda: {
    title: "Central de ajuda",
    subtitle: "Respostas rápidas para as dúvidas mais comuns.",
    sections: [
      {
        title: "Acompanhar pedido",
        content: (
          <p>
            Acesse Minha conta → Pedidos ou utilize o link enviado por e-mail
            após a compra. O rastreio fica disponível quando a etiqueta é
            gerada.
          </p>
        ),
      },
      {
        title: "Problemas no pagamento",
        content: (
          <p>
            Se o pagamento não foi aprovado, retorne ao carrinho e use a opção
            &quot;Retomar pagamento&quot; para pedidos pendentes no mesmo
            navegador.
          </p>
        ),
      },
      {
        title: "Fale conosco",
        content: (
          <p>
            E-mail:{" "}
            <a
              href="mailto:contato@yora.com.br"
              className="text-yora-charcoal underline underline-offset-4"
            >
              contato@yora.com.br
            </a>
            . Horário de atendimento: segunda a sexta, 9h às 18h.
          </p>
        ),
      },
    ],
  },
  trocas: {
    title: "Trocas e devoluções",
    subtitle: "Política de arrependimento conforme o Código de Defesa do Consumidor.",
    sections: [
      {
        title: "Prazo",
        content: (
          <p>
            Você tem até 7 dias corridos após o recebimento para solicitar
            devolução por arrependimento, desde que o produto esteja sem uso e
            com etiquetas.
          </p>
        ),
      },
      {
        title: "Como solicitar",
        content: (
          <p>
            Envie o número do pedido e o motivo para{" "}
            <a
              href="mailto:contato@yora.com.br"
              className="text-yora-charcoal underline underline-offset-4"
            >
              contato@yora.com.br
            </a>
            . Nossa equipe enviará as instruções de postagem ou coleta.
          </p>
        ),
      },
      {
        title: "Reembolso",
        content: (
          <p>
            Após análise do produto devolvido, o reembolso é processado no
            mesmo meio de pagamento em até 10 dias úteis.
          </p>
        ),
      },
    ],
  },
  entrega: {
    title: "Entrega",
    subtitle: "Informações sobre prazos, fretes e rastreamento.",
    sections: [
      {
        title: "Cálculo do frete",
        content: (
          <p>
            O valor e o prazo são calculados no checkout com base no CEP de
            destino, peso e dimensões dos produtos.
          </p>
        ),
      },
      {
        title: "Prazo de envio",
        content: (
          <p>
            Pedidos pagos são separados em até 2 dias úteis. O prazo de
            transporte informado no checkout passa a contar após a postagem.
          </p>
        ),
      },
      {
        title: "Rastreamento",
        content: (
          <p>
            Quando o pedido for despachado, o código de rastreio ficará
            disponível em Minha conta → Pedidos.
          </p>
        ),
      },
    ],
  },
  sobre: {
    title: "Sobre a YORA",
    subtitle: "Moda premium para quem vive entre treino, trabalho e presença.",
    sections: [
      {
        title: "Nossa proposta",
        content: (
          <p>
            A YORA une performance e estética em peças versáteis para o dia a
            dia, com materiais selecionados e acabamento premium.
          </p>
        ),
      },
    ],
  },
  lojas: {
    title: "Lojas",
    subtitle: "Atendimento online com envio para todo o Brasil.",
    sections: [
      {
        title: "Loja online",
        content: (
          <p>
            Por enquanto operamos exclusivamente pelo e-commerce. Novidades sobre
            pontos físicos serão anunciadas em nossos canais oficiais.
          </p>
        ),
      },
    ],
  },
  contato: {
    title: "Contato",
    sections: [
      {
        title: "Atendimento",
        content: (
          <>
            <p>
              E-mail:{" "}
              <a
                href="mailto:contato@yora.com.br"
                className="text-yora-charcoal underline underline-offset-4"
              >
                contato@yora.com.br
              </a>
            </p>
            <p>Segunda a sexta, das 9h às 18h (horário de Brasília).</p>
          </>
        ),
      },
    ],
  },
  carreiras: {
    title: "Trabalhe conosco",
    subtitle: "Faça parte do time YORA.",
    sections: [
      {
        title: "Vagas abertas",
        content: (
          <p>
            No momento não há vagas publicadas. Envie seu currículo para{" "}
            <a
              href="mailto:contato@yora.com.br"
              className="text-yora-charcoal underline underline-offset-4"
            >
              contato@yora.com.br
            </a>{" "}
            com o assunto &quot;Carreiras&quot;.
          </p>
        ),
      },
    ],
  },
} satisfies Record<string, StoreInfoPageContent>;
