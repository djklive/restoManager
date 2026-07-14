import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AUTH_HERO } from "@/features/auth/constants";
import { useLoginMutation } from "@/features/auth/hooks";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas";

export function LoginPage() {
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", motDePasse: "" },
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <AuthShell heroImage={AUTH_HERO.login} logoVariant="primary">
      <div className="mb-6 space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bon retour parmi nous
        </h1>
        <p className="text-sm text-muted-foreground">
          Veuillez vous connecter pour gérer votre restaurant.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Adresse Email</Label>
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="manager@restaurant.cm"
            icon={Mail}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motDePasse">Mot de passe</Label>
          <AuthInput
            id="motDePasse"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={Lock}
            showPasswordToggle
            {...register("motDePasse")}
          />
          {errors.motDePasse && (
            <p className="text-xs text-destructive">
              {errors.motDePasse.message}
            </p>
          )}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="h-12 w-full rounded-full bg-brand-primary text-base font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90"
          >
            {loginMutation.isPending ? "Connexion..." : "Se connecter"}
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </form>

      <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          to="/register"
          className="font-semibold text-brand-primary hover:underline"
        >
          Créer mon restaurant
        </Link>
      </div>
    </AuthShell>
  );
}
