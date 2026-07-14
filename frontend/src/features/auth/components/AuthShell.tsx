import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: ReactNode;
  heroImage: string;
  heroMode?: "overlay" | "full";
  logoVariant?: "primary" | "white" | "dark";
  showTagline?: boolean;
  className?: string;
}

export function AuthShell({
  children,
  heroImage,
  heroMode = "overlay",
  logoVariant = "primary",
  showTagline = false,
  className,
}: AuthShellProps) {
  if (heroMode === "full") {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-4 sm:p-6">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-10 flex w-full max-w-md flex-col items-center gap-4"
        >
          <div className="rounded-full bg-white px-5 py-2.5 shadow-lg">
            <BrandLogo variant="dark" size="sm" />
          </div>
          <div
            className={cn(
              "w-full rounded-3xl bg-white p-6 shadow-2xl sm:p-8",
              className
            )}
          >
            {children}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <div className="relative h-48 shrink-0 overflow-hidden sm:h-56">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-white" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-8">
          <BrandLogo
            variant={logoVariant}
            showTagline={showTagline}
            size="md"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={cn(
          "-mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-white px-5 pt-8 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] sm:mx-auto sm:w-full sm:max-w-md sm:rounded-3xl sm:shadow-xl",
          className
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
