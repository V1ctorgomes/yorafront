import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = "center",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-6 md:mb-8",
        align === "center" && "text-center",
        className,
      )}
    >
      <h2 className="font-display text-3xl tracking-wide text-yora-charcoal md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-yora-muted md:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
