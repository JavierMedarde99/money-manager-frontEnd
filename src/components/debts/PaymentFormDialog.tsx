import { useState } from "react";
import { Loader2 } from "lucide-react";
import { paymentApi } from "@/api/payment";
import type {
  DebtResponseDTO,
  PaymentRequestDTO,
  PaymentResponseDTO,
} from "@/types";
import { getRemainingAmount } from "@/lib/debts";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentFormDialogProps {
  debt: DebtResponseDTO;
  /** `null` para registrar un pago nuevo. */
  payment: PaymentResponseDTO | null;
  onClose: () => void;
  /** Cierra y recarga deuda + pagos (lo hace la página). */
  onSaved: () => void | Promise<void>;
}

/**
 * Formulario de pago. Autocontenido, igual que `DebtFormDialog`: el padre lo
 * monta solo cuando está abierto.
 *
 * Al editar, "Pago automático" siempre empieza en `false` porque
 * `PaymentResponseDTO` no devuelve el campo (limitación del backend).
 */
export function PaymentFormDialog({
  debt,
  payment,
  onClose,
  onSaved,
}: PaymentFormDialogProps) {
  const [paymentDate, setPaymentDate] = useState(
    payment?.paymentDate ?? new Date().toISOString().split("T")[0]
  );
  const [amount, setAmount] = useState(() => {
    if (payment) return payment.amount;
    const remaining = getRemainingAmount(debt);
    return remaining > 0 ? remaining : 0;
  });
  const [automaticPayment, setAutomaticPayment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: PaymentRequestDTO = {
      paymentDate,
      amount,
      automaticPayment,
      debt: { id: debt.id } as DebtResponseDTO,
    };

    try {
      if (payment) {
        await paymentApi.update(payment.id, payload);
      } else {
        await paymentApi.insert(payload);
      }
      await onSaved();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "Error al guardar el pago"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>
            {payment ? "Editar Pago" : "Registrar Pago"}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4 p-3 rounded-xl bg-muted">
          <p className="text-sm font-semibold">{debt.name}</p>
          <p className="text-xs text-muted-foreground">
            Restante: {getRemainingAmount(debt).toFixed(2)} €
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay-date">Fecha del pago</Label>
              <Input
                id="pay-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pay-amount">Monto (€)</Label>
              <Input
                id="pay-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
            <div className="space-y-1">
              <Label htmlFor="pay-automatic">Pago automático</Label>
              <p className="text-xs text-muted-foreground">
                Se repetirá cada principio de mes
              </p>
            </div>
            <Toggle
              id="pay-automatic"
              checked={automaticPayment}
              onCheckedChange={setAutomaticPayment}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : payment ? (
                "Guardar"
              ) : (
                "Registrar Pago"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
