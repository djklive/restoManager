import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/features/auth/useAuth";

export function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>

      <BrandLogo variant="primary" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenue</h1>
        <p className="max-w-md text-muted-foreground">
          {user
            ? `Bonjour ${user.nom}. Votre session est active.`
            : "Votre session est active."}{" "}
          Le dashboard complet arrivera avec le module Menu.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {user?.role === "GERANT" && (
          <Link
            to="/equipe"
            className="inline-flex h-10 items-center rounded-lg bg-brand-primary px-4 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90"
          >
            Gestion d&apos;équipe
          </Link>
        )}
        {user?.role === "ADMIN" && (
          <Link
            to="/admin/restaurants"
            className="inline-flex h-10 items-center rounded-lg bg-brand-primary px-4 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90"
          >
            Dashboard admin
          </Link>
        )}
      </div>
    </div>
  );
}
