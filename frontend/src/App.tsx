import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { queryClient } from "@/lib/query-client";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { TeamPage } from "@/features/team/pages/TeamPage";
import { AdminRestaurantsPage } from "@/features/admin/pages/AdminRestaurantsPage";
import { DashboardPage } from "@/pages/DashboardPage";

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/equipe"
              element={
                <ProtectedRoute roles={["GERANT"]}>
                  <TeamPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/restaurants"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminRestaurantsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
