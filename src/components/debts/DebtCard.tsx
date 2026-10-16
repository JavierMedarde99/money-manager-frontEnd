import {
  Banknote,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import type {
  DebtResponseDTO,
  PagePaymentResponseDTO,
  PaymentResponseDTO,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProgress, getRemainingAmount } from "@/lib/debts";

interface DebtCardProps {
  debt: DebtResponseDTO;
  isExpanded: boolean;
  paymentsPage: PagePaymentResponseDTO | null;
  paymentsLoading: boolean;
  onToggle: (id: number) => void;
  onEdit: (debt: DebtResponseDTO) => void;
  onDelete: (id: number) => void;
  onAddPayment: (debt: DebtResponseDTO) => void;
  onEditPayment: (debt: DebtResponseDTO, payment: PaymentResponseDTO) => void;
  onDeletePayment: (debtId: number, paymentId: number) => void;
}

export function DebtCard({
  debt,
  isExpanded,
  paymentsPage,
  paymentsLoading,
  onToggle,
  onEdit,
  onDelete,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
}: DebtCardProps) {
  const remaining = getRemainingAmount(debt);
  const progress = getProgress(debt);
  const isPaid = remaining <= 0;
  const paymentsId = `debt-payments-${debt.id}`;

  return (
    <Card className="card-gloss overflow-hidden">
      <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
        <button
          type="button"
          className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center text-left cursor-pointer"
          onClick={() => onToggle(debt.id)}
          aria-expanded={isExpanded}
          aria-controls={paymentsId}
        >
          <div>
            <p className="font-bold truncate" title={debt.name}>
              {debt.name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {debt.startDate}
                {debt.endDate && ` → ${debt.endDate}`}
              </span>
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
                  background: isPaid
                    ? "linear-gradient(90deg, #22c55e, #16a34a)"
                    : "linear-gradient(90deg, #e040a0, #7c52aa)",
                }}
              />
            </div>
            <Badge variant={isPaid ? "tertiary" : "default"}>
              {isPaid ? "Pagada" : `${Math.round(progress)}%`}
            </Badge>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {!isPaid && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onAddPayment(debt);
              }}
              className="text-green-600 hover:text-green-700"
              title="Registrar pago"
              aria-label={`Registrar pago de ${debt.name}`}
            >
              <Banknote className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(debt);
            }}
            aria-label={`Editar ${debt.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(debt.id);
            }}
            aria-label={`Eliminar ${debt.name}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Payments section — kept in the DOM (hidden when collapsed) so
          the header button's aria-controls always points to a real id */}
      <div id={paymentsId} hidden={!isExpanded}>
        {isExpanded && (
          <div className="animate-bounce-in">
            <Separator />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm">
                  Pagos ({paymentsPage?.totalElements ?? 0})
                </h4>
                {!isPaid && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPayment(debt);
                    }}
                  >
                    <Banknote className="h-3 w-3" />
                    Registrar Pago
                  </Button>
                )}
              </div>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !paymentsPage || paymentsPage.content.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No se han registrado pagos para esta deuda
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="text-right w-24">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsPage.content.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.paymentDate}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            -{payment.amount.toFixed(2)} €
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditPayment(debt, payment);
                                }}
                                aria-label={`Editar pago de ${payment.amount.toFixed(2)} €`}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePayment(debt.id, payment.id);
                                }}
                                aria-label={`Eliminar pago de ${payment.amount.toFixed(2)} €`}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {(paymentsPage.totalPages ?? 0) > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <span className="text-sm text-muted-foreground">
                        Página 1 de {paymentsPage.totalPages}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
