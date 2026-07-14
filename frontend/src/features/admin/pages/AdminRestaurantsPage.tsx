import {
  AlertTriangle,
  CheckCircle2,
  LayoutDashboard,
  Search,
  Settings,
  Store,
  Users,
  ChartColumn,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import {
  useRestaurantsQuery,
  useUpdateRestaurantStatusMutation,
} from "@/features/admin/hooks";
import { cn } from "@/lib/utils";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function AdminRestaurantsPage() {
  const { user, logout } = useAuth();
  const { data: restaurants = [], isLoading } = useRestaurantsQuery();
  const statusMutation = useUpdateRestaurantStatusMutation();

  const total = restaurants.length;
  const actifs = restaurants.filter((r) => r.statutAbonnement === "actif").length;
  const suspendus = restaurants.filter(
    (r) => r.statutAbonnement === "suspendu"
  ).length;

  return (
    <div className="flex min-h-svh bg-[#F8FAFC]">
      <aside className="hidden w-64 shrink-0 border-r border-[#E5E7EB] bg-[#F3F4F6] lg:flex lg:flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-primary text-white">
            <UtensilsCrossed className="size-4" />
          </div>
          <span className="text-lg font-bold text-brand-primary">
            RestoAdmin
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {[
            { label: "Tableau de Bord", icon: LayoutDashboard },
            { label: "Restaurants", icon: Store, active: true },
            { label: "Utilisateurs", icon: Users },
            { label: "Rapports globaux", icon: ChartColumn },
            { label: "Paramètres système", icon: Settings },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                item.active
                  ? "bg-[#FFE8E0] text-brand-primary"
                  : "text-[#6B7280]"
              )}
            >
              {item.active && (
                <span className="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r bg-brand-primary" />
              )}
              <item.icon className="size-4" />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-brand-primary/10 font-semibold text-brand-primary">
              {(user?.nom?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.nom ?? "Admin"}
              </p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-4 py-3 sm:px-6">
          <p className="font-semibold text-foreground">RestoManager</p>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher un restaurant..."
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pr-3 pl-9 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-semibold text-muted-foreground">
            {(user?.nom?.[0] ?? "A").toUpperCase()}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Gestion des Restaurants
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gérez les établissements partenaires, leurs statuts et accès.
            </p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Restaurants
                  </p>
                  <p className="mt-1 text-3xl font-bold">{total}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-[#FFE8E0] text-brand-primary">
                  <Store className="size-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="mt-1 text-3xl font-bold">{actifs}</p>
                  <p className="mt-1 text-xs font-medium text-brand-secondary">
                    Opérationnels
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-[#DCFCE7] text-brand-secondary">
                  <CheckCircle2 className="size-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspendus</p>
                  <p className="mt-1 text-3xl font-bold">{suspendus}</p>
                  <p className="mt-1 text-xs font-medium text-[#DC2626]">
                    Nécessite attention
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
                  <AlertTriangle className="size-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Restaurant</th>
                    <th className="px-4 py-3 font-medium">Localisation</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Date d&apos;inscription</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        Chargement des restaurants...
                      </td>
                    </tr>
                  ) : restaurants.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        Aucun restaurant inscrit.
                      </td>
                    </tr>
                  ) : (
                    restaurants.map((restaurant) => {
                      const isActif = restaurant.statutAbonnement === "actif";
                      return (
                        <tr
                          key={restaurant.id}
                          className="border-b border-[#F3F4F6] last:border-0"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FFE8E0] text-brand-primary">
                                <Store className="size-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {restaurant.nom}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {restaurant.nombreUtilisateurs} utilisateur
                                  {restaurant.nombreUtilisateurs > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {restaurant.adresse || "—"}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  isActif ? "bg-brand-secondary" : "bg-[#9CA3AF]"
                                )}
                              />
                              {isActif ? "Actif" : "Suspendu"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">
                            {formatDate(restaurant.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              disabled={
                                statusMutation.isPending &&
                                statusMutation.variables?.id === restaurant.id
                              }
                              onClick={() =>
                                statusMutation.mutate({
                                  id: restaurant.id,
                                  statutAbonnement: isActif
                                    ? "suspendu"
                                    : "actif",
                                })
                              }
                              className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                                isActif
                                  ? "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]"
                                  : "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                              )}
                            >
                              {isActif ? "Suspendre" : "Activer"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-sm text-muted-foreground">
              <p>
                Affichage 1 à {restaurants.length || 0} sur {total}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
