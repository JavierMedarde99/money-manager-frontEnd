import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DebtCard } from "@/components/debts/DebtCard";
import { DebtFormDialog } from "@/components/debts/DebtFormDialog";
import { PaymentFormDialog } from "@/components/debts/PaymentFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { CandyLoader } from "@/components/layout/CandyLoader";
import { EmptyState } from "@/components/layout/EmptyState";
import { LoadError } from "@/components/LoadError";
import { useDebts } from "@/hooks/useDebts";

export function DebtsPage() {
  const {
    debts,
    loading,
    loadError,
    reload,
    expandedId,
    paymentsPage,
    paymentsLoading,
    toggleExpand,
    debtDialog,
    openCreateDebt,
    openEditDebt,
    paymentDialog,
    openCreatePayment,
    openEditPayment,
    deleteDebt,
    requestDeleteDebt,
    deletePayment,
    requestDeletePayment,
  } = useDebts();

  if (loading) {
    return <CandyLoader />;
  }

  return (
    <div className="animate-bounce-in space-y-6">
      <PageHeader
        title="Deudas"
        subtitle="Controla tus deudas y pagos"
        icon={CreditCard}
        iconClass="bg-primary-100 text-primary"
        actions={
          <Button onClick={openCreateDebt}>
            <Plus className="h-4 w-4" />
            Nueva Deuda
          </Button>
        }
      />

      {loadError ? (
        <LoadError
          title="No se pudieron cargar las deudas"
          onRetry={reload}
        />
      ) : debts.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No hay deudas registradas"
          hint="Registra tu primera deuda para empezar"
        />
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              isExpanded={expandedId === debt.id}
              paymentsPage={paymentsPage}
              paymentsLoading={paymentsLoading}
              onToggle={toggleExpand}
              onEdit={openEditDebt}
              onDelete={requestDeleteDebt}
              onAddPayment={openCreatePayment}
              onEditPayment={openEditPayment}
              onDeletePayment={requestDeletePayment}
            />
          ))}
        </div>
      )}

      {debtDialog.open && (
        <DebtFormDialog
          debt={debtDialog.debt}
          onClose={debtDialog.onClose}
          onSaved={debtDialog.onSaved}
        />
      )}

      {paymentDialog.open && paymentDialog.debt && (
        <PaymentFormDialog
          debt={paymentDialog.debt}
          payment={paymentDialog.payment}
          onClose={paymentDialog.onClose}
          onSaved={paymentDialog.onSaved}
        />
      )}

      <ConfirmDialog
        {...deleteDebt}
        title="Eliminar Deuda"
        description="¿Estás seguro de que quieres eliminar esta deuda y todos sus pagos asociados? Esta acción no se puede deshacer."
      />

      <ConfirmDialog
        {...deletePayment}
        title="Eliminar Pago"
        description="¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer."
      />
    </div>
  );
}
