import { InfoPage } from "@/components/store/InfoPage";

export default function TamanhosPage() {
  return (
    <InfoPage
      title="Guia de tamanhos"
      subtitle="Referências gerais para ajudar na escolha. Consulte também a tabela em cada produto."
      sections={[
        {
          title: "Como medir",
          content: (
            <p>
              Use uma fita métrica rente ao corpo, sem apertar. Para busto,
              meça na parte mais larga; para cintura, na parte mais fina do
              abdômen; para quadril, na parte mais larga.
            </p>
          ),
        },
        {
          title: "Calças",
          content: (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-yora-charcoal/10">
                    <th className="py-2 pr-4">Tamanho</th>
                    <th className="py-2 pr-4">Cintura</th>
                    <th className="py-2 pr-4">Quadril</th>
                    <th className="py-2">Comprimento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-yora-charcoal/5">
                    <td className="py-2 pr-4">P</td>
                    <td className="py-2 pr-4">62–66 cm</td>
                    <td className="py-2 pr-4">84–88 cm</td>
                    <td className="py-2">92 cm</td>
                  </tr>
                  <tr className="border-b border-yora-charcoal/5">
                    <td className="py-2 pr-4">M</td>
                    <td className="py-2 pr-4">66–70 cm</td>
                    <td className="py-2 pr-4">88–92 cm</td>
                    <td className="py-2">94 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">G</td>
                    <td className="py-2 pr-4">70–74 cm</td>
                    <td className="py-2 pr-4">92–96 cm</td>
                    <td className="py-2">96 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          title: "Camisetas e tops",
          content: (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-yora-charcoal/10">
                    <th className="py-2 pr-4">Tamanho</th>
                    <th className="py-2 pr-4">Busto</th>
                    <th className="py-2">Comprimento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-yora-charcoal/5">
                    <td className="py-2 pr-4">P</td>
                    <td className="py-2 pr-4">80–84 cm</td>
                    <td className="py-2">36 cm</td>
                  </tr>
                  <tr className="border-b border-yora-charcoal/5">
                    <td className="py-2 pr-4">M</td>
                    <td className="py-2 pr-4">84–88 cm</td>
                    <td className="py-2">38 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">G</td>
                    <td className="py-2 pr-4">88–92 cm</td>
                    <td className="py-2">40 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          title: "Dica",
          content: (
            <p>
              Em caso de dúvida entre dois tamanhos, recomendamos o maior para
              maior conforto em peças com modelagem justa.
            </p>
          ),
        },
      ]}
    />
  );
}
