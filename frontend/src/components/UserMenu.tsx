import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  if (!user) return null;

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-[#F9FAFB]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-semibold text-brand-primary">
          {user.nom.charAt(0).toUpperCase()}
        </span>
        <span className="truncate">{user.nom}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
        >
          <div className="border-b border-[#F3F4F6] px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.nom}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
          >
            <LogOut className="size-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
