import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AUTH_HERO } from "@/features/auth/constants";
import { useRegisterMutation } from "@/features/auth/hooks";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas";

export function RegisterPage() {
  const registerMutation = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nomRestaurant: "",
      nomGerant: "",
      email: "",
      motDePasse: "",
      confirmationMotDePasse: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate({
      nomRestaurant: values.nomRestaurant,
      nomGerant: values.nomGerant,
      email: values.email,
      motDePasse: values.motDePasse,
    });
  });

  return (
    <AuthShell heroImage={AUTH_HERO.register} logoVariant="dark">
      <div className="mb-6 space-y-1.5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bienvenue sur RestoManager
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez votre compte et votre restaurant en quelques secondes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="nomRestaurant">Nom du restaurant</Label>
          <AuthInput
            id="nomRestaurant"
            placeholder="Ex: Le Bon Maquis"
            icon={Store}
            {...register("nomRestaurant")}
          />
          {errors.nomRestaurant && (
            <p className="text-xs text-destructive">
              {errors.nomRestaurant.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nomGerant">Nom du gérant</Label>
          <AuthInput
            id="nomGerant"
            placeholder="Votre nom complet"
            icon={User}
            {...register("nomGerant")}
          />
          {errors.nomGerant && (
            <p className="text-xs text-destructive">
              {errors.nomGerant.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            placeholder="contact@restaurant.com"
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
            autoComplete="new-password"
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmationMotDePasse">
            Confirmation du mot de passe
          </Label>
          <AuthInput
            id="confirmationMotDePasse"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
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

        <motion.div whileTap={{ scale: 0.98 }} className="pt-2">
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="h-12 w-full rounded-full bg-brand-primary text-base font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90"
          >
            {registerMutation.isPending
              ? "Création..."
              : "Créer mon restaurant"}
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-primary hover:underline"
        >
          Se connecter
        </Link>
      </div>
    </AuthShell>
  );
}
