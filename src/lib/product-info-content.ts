type SizeRow = {
  size: string;
  measurements: string[];
};

export type ProductInfoTab = "about" | "measurements" | "care";

export interface ProductInfoContent {
  about: string;
  measurements: {
    title: string;
    headers: string[];
    rows: SizeRow[];
    note?: string;
  };
  care: {
    title: string;
    items: string[];
  };
}

const DEFAULT_MEASUREMENTS: Record<
  string,
  Omit<ProductInfoContent["measurements"], "title">
> = {
  calcas: {
    headers: ["Tamanho", "Cintura", "Quadril", "Comprimento"],
    rows: [
      { size: "P", measurements: ["62–66 cm", "84–88 cm", "92 cm"] },
      { size: "M", measurements: ["66–70 cm", "88–92 cm", "94 cm"] },
      { size: "G", measurements: ["70–74 cm", "92–96 cm", "96 cm"] },
    ],
    note: "Medidas do corpo em posição ereta. Tecido com elasticidade em quatro vias.",
  },
  camisetas: {
    headers: ["Tamanho", "Busto", "Comprimento"],
    rows: [
      { size: "P", measurements: ["80–84 cm", "36 cm"] },
      { size: "M", measurements: ["84–88 cm", "38 cm"] },
      { size: "G", measurements: ["88–92 cm", "40 cm"] },
    ],
    note: "Medidas da peça estendida. Modelagem justa ao corpo.",
  },
  moletons: {
    headers: ["Tamanho", "Busto", "Comprimento", "Manga"],
    rows: [
      { size: "P", measurements: ["96 cm", "58 cm", "58 cm"] },
      { size: "M", measurements: ["100 cm", "60 cm", "60 cm"] },
      { size: "G", measurements: ["104 cm", "62 cm", "62 cm"] },
    ],
    note: "Medidas da peça estendida. Corte relaxed com folga confortável.",
  },
};

const DEFAULT_CARE: string[] = [
  "Lavar à mão ou no ciclo delicado, com água fria.",
  "Não usar alvejante nem amaciante em excesso.",
  "Secar à sombra; evitar secadora para preservar elasticidade.",
  "Passar com ferro em temperatura baixa, se necessário.",
  "Não lavar junto com peças com zíper ou velcro para evitar pilling.",
];

function getDefaultMeasurements(categorySlug: string) {
  return (
    DEFAULT_MEASUREMENTS[categorySlug] ?? {
      headers: ["Tamanho", "Medida principal"],
      rows: [
        { size: "P", measurements: ["Consulte a tabela da categoria"] },
        { size: "M", measurements: ["Consulte a tabela da categoria"] },
        { size: "G", measurements: ["Consulte a tabela da categoria"] },
      ],
      note: "Em caso de dúvida entre dois tamanhos, recomendamos o maior.",
    }
  );
}

export function buildProductInfoContent(params: {
  description?: string | null;
  shortDescription?: string | null;
  categorySlug: string;
  measurementsGuide?: string | null;
  careInstructions?: string | null;
}): ProductInfoContent {
  const about =
    params.description?.trim() ||
    params.shortDescription?.trim() ||
    "Peça desenvolvida com tecidos premium para treino e uso diário.";

  const defaultMeasurements = getDefaultMeasurements(params.categorySlug);

  if (params.measurementsGuide?.trim()) {
    return {
      about,
      measurements: {
        title: "Tabela de medidas",
        headers: ["Informação"],
        rows: params.measurementsGuide
          .split("\n")
          .filter(Boolean)
          .map((line, index) => ({
            size: String(index + 1),
            measurements: [line.trim()],
          })),
      },
      care: {
        title: "Cuidados com a peça",
        items: params.careInstructions?.trim()
          ? params.careInstructions.split("\n").filter(Boolean).map((s) => s.trim())
          : DEFAULT_CARE,
      },
    };
  }

  return {
    about,
    measurements: {
      title: "Tabela de medidas",
      ...defaultMeasurements,
    },
    care: {
      title: "Cuidados com a peça",
      items: params.careInstructions?.trim()
        ? params.careInstructions.split("\n").filter(Boolean).map((s) => s.trim())
        : DEFAULT_CARE,
    },
  };
}
