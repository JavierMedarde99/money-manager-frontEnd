import { useState, useEffect, useCallback } from "react";
import { debtApi } from "@/api/debt";
import type { DebtResponseDTO, DebtRequestDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
} from "lucide-react";

export function DebtsPage() {
  const [debts, setDebts] = useState<DebtResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DebtResponseDTO | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [starDate, setStarDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchDebts = useCallback(async () => {
    try {
      const data = await debtApi.getAll();
      setDebts(data);
    } catch (error) {
      console.error("Error fetching debts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setTotalAmount(0);
    setStarDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setDialogOpen(true);
  };

  const openEdit = (debt: DebtResponseDTO) => {
    setEditing(debt);
    setName(debt.name);
    setTotalAmount(debt.totalAmount);
    setStarDate(debt.starDate);
    setEndDate(debt.endDate || "");
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: DebtRequestDTO = {
      name,
      totalAmount,
      starDate,
      endDate: endDate || undefined,
    };

    try {
      if (editing) {
        await debtApi.update(editing.id, payload);
      } else {
        await debtApi.insert(payload);
      }
      setDialogOpen(false);
      await fetchDebts();
    } catch (error) {
      console.error("Error saving debt:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await debtApi.delete(id);
      await fetchDebts();
    } catch (error) {
      console.error("Error deleting debt:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getRemainingAmount = (debt: DebtResponseDTO) => {
    const paid = debt.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    return debt.totalAmount - paid;
  };

  const getProgress = (debt: DebtResponseDTO) => {
    if (debt.totalAmount === 0) return 100;
    const paid = debt.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    return Math.min(100, (paid / debt.totalAmount) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-bounce-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">Deudas</h1>
          <p className="text-muted-foreground">Controla tus deudas y pagos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nueva Deuda
        </Button>
      </div>

      {debts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hay deudas registradas</p>
          <p className="text-sm">Registra tu primera deuda para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => {
            const remaining = getRemainingAmount(debt);
            const progress = getProgress(debt);
            const isExpanded = expandedId === debt.id;
            const isPaid = remaining <= 0;

            return (
              <Card key={debt.id} className="overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(debt.id)}
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="font-bold">{debt.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {debt.starDate}
                        {debt.endDate && ` → ${debt.endDate}`}
                      </p>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-bold flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {debt.totalAmount.toFixed(2)} €
                      </p>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-xs text-muted-foreground">Restante</p>
                      <p
                        className={`font-bold flex items-center gap-1 ${
                          isPaid ? "text-green-600" : "text-primary"
                        }`}
                      >
                        <DollarSign className="h-3 w-3" />
                        {remaining.toFixed(2)} €
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: isPaid ? "#22c55e" : "#e040a0",
                          }}
                        />
                      </div>
                      <Badge variant={isPaid ? "tertiary" : "default"}>
                        {isPaid
                          ? "Pagada"
                          : `${Math.round(progress)}%`}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(debt);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(debt.id);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Payments section */}
                {isExpanded && (
                  <div className="animate-bounce-in">
                    <Separator />
                    <div className="p-4">
                      <h4 className="font-bold text-sm mb-3">
                        Pagos ({debt.payments?.length || 0})
                      </h4>
                      {!debt.payments || debt.payments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No se han registrado pagos para esta deuda
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {debt.payments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{payment.paymentDate}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  {payment.amount.toFixed(2)} €
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar Deuda" : "Nueva Deuda"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
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
                  value={starDate}
                  onChange={(e) => setStarDate(e.target.value)}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editing ? (
                  "Guardar"
                ) : (
                  "Crear"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent onClose={() => setDeleteConfirm(null)}>
          <DialogHeader>
            <DialogTitle>Eliminar Deuda</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground mt-2">
            ¿Estás seguro de que quieres eliminar esta deuda y todos sus pagos
            asociados? Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
