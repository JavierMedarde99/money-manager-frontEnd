import { useCallback, useEffect, useState } from "react";
import { debtApi } from "@/api/debt";
import { paymentApi } from "@/api/payment";
import { FETCH_ALL_SIZE } from "@/lib/pagination";
import type {
  DebtResponseDTO,
  PagePaymentResponseDTO,
  PaymentResponseDTO,
} from "@/types";

/**
 * Estado y lógica de la página de Deudas: listado, expansión con sus pagos,
 * diálogos de crear/editar y confirmaciones de borrado.
 *
 * Vive en un hook para que la página solo componga la vista (antes eran ~24
 * `useState` sueltos dentro del componente de página).
 *
 * Nota: en los borrados, el `finally` cierra el diálogo también cuando hay
 * error, así que la insignia de error no llega a verse. Es el comportamiento
 * que ya tenía el código antes de extraerlo; se conserva a propósito
 * (ver issue #176).
 */
export function useDebts() {
  const [debts, setDebts] = useState<DebtResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Deuda expandida y los pagos que se muestran en su interior
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [paymentsPage, setPaymentsPage] =
    useState<PagePaymentResponseDTO | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Diálogo de deuda (crear/editar)
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtResponseDTO | null>(null);
  const [debtToDeleteId, setDebtToDeleteId] = useState<number | null>(null);
  const [deleteDebtError, setDeleteDebtError] = useState<string | null>(null);
  const [deletingDebt, setDeletingDebt] = useState(false);

  // Diálogo de pago (registrar/editar)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<DebtResponseDTO | null>(null);
  const [editingPayment, setEditingPayment] =
    useState<PaymentResponseDTO | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<{
    debtId: number;
    paymentId: number;
  } | null>(null);
  const [deletePaymentError, setDeletePaymentError] = useState<string | null>(
    null
  );
  const [deletingPayment, setDeletingPayment] = useState(false);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await debtApi.getAll(0, FETCH_ALL_SIZE);
      setDebts(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const fetchDebtPayments = useCallback(async (debtId: number) => {
    setPaymentsLoading(true);
    try {
      const debt = await debtApi.getById(debtId);
      setPaymentsPage(debt.payments);
    } catch {
      // error handled by UI state
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const toggleExpand = (id: number) => {
    const nextExpanded = expandedId === id ? null : id;
    setExpandedId(nextExpanded);
    if (nextExpanded) {
      fetchDebtPayments(id);
    } else {
      setPaymentsPage(null);
    }
  };

  // ---- Deuda: crear / editar ----
  const openCreateDebt = () => {
    setEditingDebt(null);
    setDebtDialogOpen(true);
  };

  const openEditDebt = (debt: DebtResponseDTO) => {
    setEditingDebt(debt);
    setDebtDialogOpen(true);
  };

  const closeDebtDialog = () => setDebtDialogOpen(false);

  const handleDebtSaved = async () => {
    setDebtDialogOpen(false);
    await fetchDebts();
  };

  // ---- Deuda: eliminar ----
  const requestDeleteDebt = (id: number) => setDebtToDeleteId(id);

  const closeDeleteDebt = () => {
    setDebtToDeleteId(null);
    setDeleteDebtError(null);
  };

  const confirmDeleteDebt = async () => {
    if (debtToDeleteId === null) return;
    setDeleteDebtError(null);
    setDeletingDebt(true);
    try {
      await debtApi.delete(debtToDeleteId);
      await fetchDebts();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setDeleteDebtError(
        axiosError.response?.data?.message || "No se puede eliminar la deuda"
      );
    } finally {
      setDebtToDeleteId(null);
      setDeletingDebt(false);
    }
  };

  // ---- Pago: registrar / editar ----
  const openCreatePayment = (debt: DebtResponseDTO) => {
    setPaymentDebt(debt);
    setEditingPayment(null);
    setPaymentDialogOpen(true);
  };

  const openEditPayment = (
    debt: DebtResponseDTO,
    payment: PaymentResponseDTO
  ) => {
    setPaymentDebt(debt);
    setEditingPayment(payment);
    setPaymentDialogOpen(true);
  };

  const closePaymentDialog = () => setPaymentDialogOpen(false);

  const handlePaymentSaved = async () => {
    const debtId = paymentDebt?.id;
    setPaymentDialogOpen(false);
    await fetchDebts();
    if (debtId !== undefined && expandedId === debtId) {
      await fetchDebtPayments(debtId);
    }
  };

  // ---- Pago: eliminar ----
  const requestDeletePayment = (debtId: number, paymentId: number) =>
    setPaymentToDelete({ debtId, paymentId });

  const closeDeletePayment = () => {
    setPaymentToDelete(null);
    setDeletePaymentError(null);
  };

  const confirmDeletePayment = async () => {
    if (paymentToDelete === null) return;
    const { debtId, paymentId } = paymentToDelete;
    setDeletePaymentError(null);
    setDeletingPayment(true);
    try {
      await paymentApi.delete(paymentId);
      await fetchDebts();
      if (expandedId === debtId) {
        await fetchDebtPayments(debtId);
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setDeletePaymentError(
        axiosError.response?.data?.message || "No se puede eliminar el pago"
      );
    } finally {
      setPaymentToDelete(null);
      setDeletingPayment(false);
    }
  };

  return {
    // Listado
    debts,
    loading,
    loadError,
    reload: fetchDebts,
    // Expansión y pagos de la deuda expandida
    expandedId,
    paymentsPage,
    paymentsLoading,
    toggleExpand,
    // Diálogo de deuda
    debtDialog: {
      open: debtDialogOpen,
      debt: editingDebt,
      onClose: closeDebtDialog,
      onSaved: handleDebtSaved,
    },
    openCreateDebt,
    openEditDebt,
    // Diálogo de pago
    paymentDialog: {
      open: paymentDialogOpen,
      debt: paymentDebt,
      payment: editingPayment,
      onClose: closePaymentDialog,
      onSaved: handlePaymentSaved,
    },
    openCreatePayment,
    openEditPayment,
    // Confirmación de borrado de deuda
    deleteDebt: {
      open: debtToDeleteId !== null,
      error: deleteDebtError,
      loading: deletingDebt,
      onConfirm: confirmDeleteDebt,
      onClose: closeDeleteDebt,
    },
    requestDeleteDebt,
    // Confirmación de borrado de pago
    deletePayment: {
      open: paymentToDelete !== null,
      error: deletePaymentError,
      loading: deletingPayment,
      onConfirm: confirmDeletePayment,
      onClose: closeDeletePayment,
    },
    requestDeletePayment,
  };
}
