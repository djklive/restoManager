import { forwardRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AuthInputProps extends ComponentProps<"input"> {
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      className,
      icon: Icon,
      showPasswordToggle = false,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const resolvedType =
      showPasswordToggle && type === "password"
        ? visible
          ? "text"
          : "password"
        : type;

    return (
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          ref={ref}
          type={resolvedType}
          className={cn(
            Icon && "pl-10",
            showPasswordToggle && "pr-10",
            className
          )}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
