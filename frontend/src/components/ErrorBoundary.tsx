import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Une erreur est survenue</h1>
          <p className="max-w-md text-muted-foreground">
            L&apos;application a rencontré un problème inattendu. Rechargez la
            page pour réessayer.
          </p>
          <Button onClick={() => window.location.reload()}>Recharger</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
