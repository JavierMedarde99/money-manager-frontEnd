import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadErrorProps {
  /** Message shown as the heading of the error block. */
  title?: string;
  /** When provided, renders a "Reintentar" button that calls it. */
  onRetry?: () => void;
  className?: string;
}

/**
 * Distinguishes "the API call failed" from "there is genuinely no data".
 * Renders an alert so screen readers announce the failure instead of letting
 * the user believe their data is gone.
 */
export function LoadError({
  title = "No se pudieron cargar los datos",
  onRetry,
  className,
}: LoadErrorProps) {
  return (
    <div
      role="alert"
      className={cn("text-center py-10 space-y-4 animate-fade-up", className)}
    >
      <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">
          Comprueba tu conexión e inténtalo de nuevo.
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
