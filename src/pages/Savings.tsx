import { useState, useEffect, useCallback } from "react";
import { savingsApi } from "@/api/savings";
import type { SavingsResponseDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { CandyLoader } from "@/components/layout/CandyLoader";
import { EmptyState } from "@/components/layout/EmptyState";
import { PiggyBank } from "lucide-react";

export function SavingsPage() {
  const [savings, setSavings] = useState<SavingsResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSavings = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await savingsApi.getAll();
      setSavings(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  if (loading) {
    return <CandyLoader />;
  }

  return (
    <div className="animate-bounce-in space-y-8">
      <PageHeader
        title="Ahorros"
        subtitle="Tus ahorros mes a mes"
        icon={PiggyBank}
      />
      {error ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Error al cargar los ahorros
          </p>
          <Button onClick={fetchSavings}>Reintentar</Button>
        </div>
      ) : savings.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Sin datos de ahorros"
          hint="Registra ingresos y gastos para ver tu ahorro aquí"
        />
      ) : null}
    </div>
  );
}