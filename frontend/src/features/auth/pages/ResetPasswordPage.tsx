import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AUTH_HERO } from "@/features/auth/constants";
import { useResetPasswordMutation } from "@/features/auth/hooks";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const resetMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      motDePasse: "",
      confirmationMotDePasse: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!token) return;
    resetMutation.mutate({
      token,
      motDePasse: values.motDePasse,
    });
  });

  return (
    <AuthShell heroImage={AUTH_HERO.reset} heroMode="full">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Réinitialiser votre mot de passe
        </h1>
        <p className="text-sm text-muted-foreground">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>
      </div>

      {!token ? (
        <div className="rounded-2xl bg-destructive/10 px-4 py-5 text-center text-sm text-destructive">
          Lien de réinitialisation invalide ou manquant.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="motDePasse">Nouveau mot de passe</Label>
            <AuthInput
              id="motDePasse"
              type="password"
              autoComplete="new-password"
              placeholder="Entrez votre nouveau mot de passe"
              icon={Lock}
              showPasswordToggle
              {...register("motDePasse")}
            />
            {errors.motDePasse && (
              <p className="text-xs text-destructive">
                {errors.motDePasse.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmationMotDePasse">
              Confirmation du mot de passe
            </Label>
            <AuthInput
              id="confirmationMotDePasse"
              type="password"
              autoComplete="new-password"
              placeholder="Confirmez votre mot de passe"
              icon={Lock}
              showPasswordToggle
              {...register("confirmationMotDePasse")}
            />
            {errors.confirmationMotDePasse && (
              <p className="text-xs text-destructive">
                {errors.confirmationMotDePasse.message}
              </p>
            )}
          </div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="h-12 w-full rounded-full bg-brand-primary text-base font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90"
            >
              {resetMutation.isPending
                ? "Réinitialisation..."
                : "Réinitialiser mon mot de passe"}
            </Button>
          </motion.div>
        </form>
      )}

      <div className="mt-8 border-t border-border pt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Retour à la connexion
        </Link>
      </div>
    </AuthShell>
  );
}
