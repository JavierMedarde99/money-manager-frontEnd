import * as React from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "warning" | "success";

const alertVariants: Record<AlertVariant, string> = {
  error: "bg-red-50 border-red-200 text-red-600",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  success: "bg-green-50 border-green-200 text-green-600",
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

/**
 * Bloque de mensaje para errores (`error`), avisos (`warning`) y
 * confirmaciones (`success`).
 *
 * Unifica la forma que antes variaba entre páginas: `rounded-xl` en casi todas
 * y `rounded-full` en Login/Register/Profile (una píldora para un texto de
 * varias líneas). Mantiene `role="alert"` por defecto para que los lectores de
 * pantalla lo anuncien; se puede sobrescribir pasando `role`.
 */
export function Alert({ variant = "error", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border p-3 text-sm text-center",
        alertVariants[variant],
        className
      )}
      {...props}
    />
  );
}
