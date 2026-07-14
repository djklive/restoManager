import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChartColumn,
  Plus,
  ReceiptText,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { useAuth } from "@/features/auth/useAuth";
import { UserMenu } from "@/components/UserMenu";
import {
  useCreateUserMutation,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from "@/features/team/hooks";
import {
  createStaffSchema,
  type CreateStaffFormValues,
} from "@/features/team/schemas";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/api/types";

const roleLabel: Record<string, string> = {
  GERANT: "Gérant",
  SERVEUR: "Serveur",
  CAISSIER: "Caissier",
};

function StaffCard({
  member,
  canToggle,
  onToggle,
  isToggling,
}: {
  member: AuthUser;
  canToggle: boolean;
  onToggle: (actif: boolean) => void;
  isToggling: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3.5 shadow-sm"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-muted-foreground">
        <UserRound className="size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{member.nom}</p>
        <p className="text-sm text-muted-foreground">
          {roleLabel[member.role] ?? member.role}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            member.actif
              ? "bg-[#DCFCE7] text-[#166534]"
              : "bg-[#F3F4F6] text-[#4B5563]"
          )}
        >
          {member.actif ? "Actif" : "Inactif"}
        </span>

        {canToggle && (
          <button
            type="button"
            disabled={isToggling}
            onClick={() => onToggle(!member.actif)}
            aria-label={
              member.actif ? "Désactiver le compte" : "Activer le compte"
            }
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors disabled:opacity-50",
              member.actif ? "bg-brand-primary" : "bg-[#D1D5DB]"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                member.actif && "translate-x-5"
              )}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function AddMemberForm({ onClose }: { onClose: () => void }) {
  const createMutation = useCreateUserMutation(onClose);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      nom: "",
      email: "",
      motDePasse: "",
      role: "SERVEUR",
    },
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Nouveau membre</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="nom">Nom</Label>
          <AuthInput id="nom" placeholder="Nom complet" {...register("nom")} />
          {errors.nom && (
            <p className="text-xs text-destructive">{errors.nom.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <AuthInput
            id="email"
            type="email"
            placeholder="email@restaurant.cm"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="motDePasse">Mot de passe</Label>
          <AuthInput
            id="motDePasse"
            type="password"
            showPasswordToggle
            placeholder="••••••••"
            {...register("motDePasse")}
          />
          {errors.motDePasse && (
            <p className="text-xs text-destructive">
              {errors.motDePasse.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Rôle</Label>
          <select
            id="role"
            className="flex h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20"
            {...register("role")}
          >
            <option value="SERVEUR">Serveur</option>
            <option value="CAISSIER">Caissier</option>
          </select>
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="h-11 w-full rounded-full bg-brand-primary font-semibold text-white hover:bg-brand-primary/90"
        >
          {createMutation.isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </form>
    </motion.div>
  );
}

export function TeamPage() {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { data: users = [], isLoading } = useUsersQuery();
  const statusMutation = useUpdateUserStatusMutation();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-[#F9FAFB]">
      <main className="flex-1 px-4 pt-6 pb-24">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Gestion d&apos;équipe
          </h1>
          <UserMenu />
        </div>

        <motion.div whileTap={{ scale: 0.98 }} className="mb-5">
          <Button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="h-12 w-full rounded-full bg-brand-primary text-base font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90"
          >
            <Plus className="size-4" />
            Ajouter un membre
          </Button>
        </motion.div>

        <AnimatePresence>
          {showForm && <AddMemberForm onClose={() => setShowForm(false)} />}
        </AnimatePresence>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Chargement de l&apos;équipe...
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((member) => {
              const canToggle =
                member.id !== user?.id &&
                (member.role === "SERVEUR" || member.role === "CAISSIER");

              return (
                <StaffCard
                  key={member.id}
                  member={member}
                  canToggle={canToggle}
                  isToggling={
                    statusMutation.isPending &&
                    statusMutation.variables?.id === member.id
                  }
                  onToggle={(actif) =>
                    statusMutation.mutate({ id: member.id, actif })
                  }
                />
              );
            })}
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
          {[
            { label: "Commandes", icon: ReceiptText },
            { label: "Menu", icon: BookOpen },
            { label: "Équipe", icon: Users, active: true },
            { label: "Rapports", icon: ChartColumn },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs",
                item.active
                  ? "text-brand-primary"
                  : "text-muted-foreground opacity-60"
              )}
            >
              <item.icon className="size-5" />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
