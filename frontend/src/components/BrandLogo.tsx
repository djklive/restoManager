import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "primary" | "white" | "dark";
  showTagline?: boolean;
  size?: "sm" | "md";
}

export function BrandLogo({
  className,
  variant = "primary",
  showTagline = false,
  size = "md",
}: BrandLogoProps) {
  const textColor =
    variant === "white"
      ? "text-white"
      : variant === "dark"
        ? "text-foreground"
        : "text-brand-primary";

  const iconBox =
    size === "sm" ? "size-8 rounded-lg" : "size-10 rounded-xl";
  const titleSize = size === "sm" ? "text-lg" : "text-xl";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex items-center justify-center bg-brand-primary text-white shadow-sm",
            iconBox
          )}
        >
          <UtensilsCrossed className={size === "sm" ? "size-4" : "size-5"} />
        </div>
        <span className={cn("font-bold tracking-tight", titleSize, textColor)}>
          RestoManager
        </span>
      </div>
      {showTagline && (
        <p className={cn("text-sm", variant === "white" ? "text-white/85" : "text-muted-foreground")}>
          Gestion simplifiée
        </p>
      )}
    </div>
  );
}
