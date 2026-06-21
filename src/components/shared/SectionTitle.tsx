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
        "mb-3 md:mb-4",
        align === "center" && "text-center",
        className,
      )}
    >
      <h2 className="font-display text-3xl tracking-wide text-yora-charcoal md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mx-auto mt-2 max-w-xl text-sm leading-relaxed text-yora-muted md:text-base",
            align === "left" && "mx-0",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
