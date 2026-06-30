import type { ReactNode } from "react";

interface InfoSection {
  title: string;
  content: ReactNode;
}

interface InfoPageProps {
  title: string;
  subtitle?: string;
  sections: InfoSection[];
}

export function InfoPage({ title, subtitle, sections }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <h1 className="font-display text-4xl text-yora-charcoal">{title}</h1>
      {subtitle && (
        <p className="mt-4 text-sm leading-relaxed text-yora-muted">{subtitle}</p>
      )}
      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl text-yora-charcoal">
              {section.title}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-yora-muted">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
