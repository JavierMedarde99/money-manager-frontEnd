import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  /** Texto del botón de confirmación. Por defecto "Eliminar". */
  confirmLabel?: string;
  /** Si hay error se muestra en lugar de la descripción y solo se ofrece cerrar. */
  error?: string | null;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmación destructiva: descripción → error (si falla) → cerrar.
 * Estaba duplicada para deudas y pagos en `Debts.tsx`.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  error,
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {error ? (
          <div
            role="alert"
            className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center mt-2"
          >
            {error}
          </div>
        ) : (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {error ? "Cerrar" : "Cancelar"}
          </Button>
          {!error && (
            <Button variant="destructive" disabled={loading} onClick={onConfirm}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                confirmLabel
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
