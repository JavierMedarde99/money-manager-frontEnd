import { useState } from "react";
import { Loader2 } from "lucide-react";
import { debtApi } from "@/api/debt";
import type { DebtRequestDTO, DebtResponseDTO } from "@/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DebtFormDialogProps {
  /** `null` para crear una deuda nueva. */
  debt: DebtResponseDTO | null;
  onClose: () => void;
  /** Cierra y recarga la lista (lo hace la página). */
  onSaved: () => void | Promise<void>;
}

/**
 * Formulario de deuda. Es autocontenido a propósito: mantiene su propio
 * estado y se monta solo cuando está abierto (el padre lo renderiza
 * condicionalmente), de modo que cada apertura parte de valores limpios.
 */
export function DebtFormDialog({ debt, onClose, onSaved }: DebtFormDialogProps) {
  const [name, setName] = useState(debt?.name ?? "");
  const [totalAmount, setTotalAmount] = useState(debt?.totalAmount ?? 0);
  const [startDate, setStartDate] = useState(
    debt?.startDate ?? new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(debt?.endDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: DebtRequestDTO = {
      name,
      totalAmount,
      startDate,
      endDate: endDate || undefined,
    };

    try {
      if (debt) {
        await debtApi.update(debt.id, payload);
      } else {
        await debtApi.insert(payload);
      }
      await onSaved();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(
        axiosError.response?.data?.message || "No se pudo guardar la deuda"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{debt ? "Editar Deuda" : "Nueva Deuda"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && <Alert>{error}</Alert>}
          <div className="space-y-2">
            <Label htmlFor="debt-name">Nombre</Label>
            <Input
              id="debt-name"
              placeholder="Ej: Préstamo banco"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debt-amount">Monto total (€)</Label>
            <Input
              id="debt-amount"
              type="number"
              min="0"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debt-start">Fecha inicio</Label>
              <Input
                id="debt-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-end">Fecha fin (opcional)</Label>
              <Input
                id="debt-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : debt ? (
                "Guardar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
