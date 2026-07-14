import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AUTH_HERO } from "@/features/auth/constants";
import { useForgotPasswordMutation } from "@/features/auth/hooks";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";

const GENERIC_SUCCESS_MESSAGE =
  "Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.";

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotMutation = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((values) => {
    forgotMutation.mutate(values, {
      onSuccess: () => setSubmitted(true),
    });
  });

  return (
    <AuthShell
      heroImage={AUTH_HERO.forgot}
      logoVariant="white"
      showTagline
    >
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mot de passe oublié ?
        </h1>
        <p className="text-sm text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl bg-[#F0FDF4] px-4 py-8 text-center"
        >
          <CheckCircle2 className="size-10 text-brand-secondary" />
          <p className="text-sm font-medium text-foreground">
            {GENERIC_SUCCESS_MESSAGE}
          </p>
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse Email</Label>
            <AuthInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="chef@restaurant.cm"
              icon={Mail}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={forgotMutation.isPending}
              className="h-12 w-full rounded-full bg-brand-primary text-base font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary/90"
            >
              {forgotMutation.isPending ? "Envoi..." : "Envoyer le lien"}
              <Send className="size-4" />
            </Button>
          </motion.div>
        </form>
      )}

      <div className="mt-8 text-center">
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
