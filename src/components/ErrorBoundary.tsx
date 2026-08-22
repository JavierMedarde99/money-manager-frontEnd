import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Intentionally empty — error UI handles display
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-primary">
            <CardContent className="p-8 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Algo salió mal
              </h1>
              <p className="text-muted-foreground">
                Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
              </p>
              <Button onClick={() => this.setState({ hasError: false })}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
