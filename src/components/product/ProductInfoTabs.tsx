"use client";

import { useState } from "react";
import {
  buildProductInfoContent,
  type ProductInfoTab,
} from "@/lib/product-info-content";
import { cn } from "@/lib/utils";

interface ProductInfoTabsProps {
  description?: string | null;
  shortDescription?: string | null;
  categorySlug: string;
  measurementsGuide?: string | null;
  careInstructions?: string | null;
}

const TABS: { id: ProductInfoTab; label: string }[] = [
  { id: "about", label: "Sobre o produto" },
  { id: "measurements", label: "Medidas" },
  { id: "care", label: "Cuidados" },
];

export function ProductInfoTabs({
  description,
  shortDescription,
  categorySlug,
  measurementsGuide,
  careInstructions,
}: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<ProductInfoTab>("about");

  const content = buildProductInfoContent({
    description,
    shortDescription,
    categorySlug,
    measurementsGuide,
    careInstructions,
  });

  return (
    <div className="mt-10 border-t border-yora-charcoal/10 pt-8">
      <div
        className="flex gap-1 overflow-x-auto border-b border-yora-charcoal/10 pb-px scrollbar-hide"
        role="tablist"
        aria-label="Informações do produto"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`product-info-panel-${tab.id}`}
            id={`product-info-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-[11px] tracking-[0.2em] uppercase transition-colors md:px-4 md:text-xs",
              activeTab === tab.id
                ? "border-yora-charcoal text-yora-charcoal"
                : "border-transparent text-yora-muted hover:text-yora-charcoal",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {activeTab === "about" && (
          <div
            id="product-info-panel-about"
            role="tabpanel"
            aria-labelledby="product-info-tab-about"
            className="text-sm leading-relaxed text-yora-charcoal/90 md:text-base"
          >
            {content.about}
          </div>
        )}

        {activeTab === "measurements" && (
          <div
            id="product-info-panel-measurements"
            role="tabpanel"
            aria-labelledby="product-info-tab-measurements"
          >
            <p className="mb-4 text-xs tracking-[0.2em] text-yora-muted uppercase">
              {content.measurements.title}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-yora-charcoal/10">
                    {content.measurements.headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-xs font-medium tracking-widest text-yora-muted uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.measurements.rows.map((row) => (
                    <tr
                      key={row.size}
                      className="border-b border-yora-charcoal/5 last:border-0"
                    >
                      <td className="px-3 py-2.5 font-medium text-yora-charcoal">
                        {row.size}
                      </td>
                      {row.measurements.map((value, index) => (
                        <td
                          key={`${row.size}-${index}`}
                          className="px-3 py-2.5 text-yora-charcoal/90"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {content.measurements.note && (
              <p className="mt-4 text-xs leading-relaxed text-yora-muted">
                {content.measurements.note}
              </p>
            )}
          </div>
        )}

        {activeTab === "care" && (
          <div
            id="product-info-panel-care"
            role="tabpanel"
            aria-labelledby="product-info-tab-care"
          >
            <p className="mb-4 text-xs tracking-[0.2em] text-yora-muted uppercase">
              {content.care.title}
            </p>
            <ul className="space-y-2.5">
              {content.care.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-sm leading-relaxed text-yora-charcoal/90 md:text-base"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-yora-taupe"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
