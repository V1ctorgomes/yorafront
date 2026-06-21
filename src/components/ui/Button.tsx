import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-yora-charcoal text-yora-cream hover:bg-yora-charcoal/90 border border-yora-charcoal",
  secondary:
    "bg-yora-taupe text-yora-cream hover:bg-yora-taupe/90 border border-yora-taupe",
  outline:
    "bg-transparent text-yora-charcoal border border-yora-charcoal hover:bg-yora-charcoal hover:text-yora-cream",
  ghost: "bg-transparent text-yora-charcoal hover:bg-yora-charcoal/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs tracking-widest",
  md: "px-6 py-3 text-xs tracking-widest",
  lg: "px-8 py-4 text-sm tracking-widest",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: ButtonProps) {
  const styles = cn(
    "inline-flex items-center justify-center font-medium uppercase transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
