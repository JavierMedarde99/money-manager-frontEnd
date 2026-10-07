import { useState, useEffect, useCallback } from "react";
import { savingsApi } from "@/api/savings";
import type { SavingsResponseDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { CandyLoader } from "@/components/layout/CandyLoader";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calculator,
} from "lucide-react";

export function SavingsPage() {
  const [savings, setSavings] = useState<SavingsResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

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

  const now = new Date();
  const currentYear = now.getFullYear();
  const yearsAsc = [...new Set(savings.map((s) => s.year))].sort(
    (a, b) => a - b
  );
  const year =
    selectedYear ??
    (yearsAsc.includes(currentYear) ? currentYear : (yearsAsc.at(-1) ?? currentYear));
  const yearMin = yearsAsc[0];
  const yearMax = yearsAsc.at(-1) ?? year;
  const yearMonths = savings
    .filter((s) => s.year === year)
    .sort((a, b) => a.month - b.month);
  const totalSavings = yearMonths.reduce((sum, s) => sum + s.savings, 0);
  const totalIncome = yearMonths.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalExpense = yearMonths.reduce((sum, s) => sum + s.totalExpense, 0);
  const avgSavings =
    yearMonths.length > 0 ? totalSavings / yearMonths.length : 0;

  const goToPrevYear = () =>
    setSelectedYear((prev) => Math.max((prev ?? year) - 1, yearMin ?? year));
  const goToNextYear = () =>
    setSelectedYear((prev) => Math.min((prev ?? year) + 1, yearMax));
  const showToday = yearsAsc.includes(currentYear) && year !== currentYear;

  const summaryCards = [
    {
      label: "Ahorro total",
      value: `${totalSavings.toFixed(2)} €`,
      icon: PiggyBank,
      color: "text-secondary",
      bg: "from-secondary-400 to-secondary-600",
    },
    {
      label: "Ingresos",
      value: `${totalIncome.toFixed(2)} €`,
      icon: TrendingUp,
      color: "text-tertiary",
      bg: "from-tertiary-400 to-tertiary-600",
    },
    {
      label: "Gastos",
      value: `${totalExpense.toFixed(2)} €`,
      icon: TrendingDown,
      color: "text-primary",
      bg: "from-primary-400 to-primary-600",
    },
    {
      label: "Media mensual",
      value: `${avgSavings.toFixed(2)} €`,
      icon: Calculator,
      color: "text-secondary",
      bg: "from-secondary-400 to-secondary-600",
    },
  ];

  if (loading) {
    return <CandyLoader />;
  }

  return (
    <div className="animate-bounce-in space-y-8">
      <PageHeader
        title="Ahorros"
        subtitle={`Resumen de ${year}`}
        icon={PiggyBank}
        actions={
          <div className="flex items-center gap-1 rounded-full bg-card border border-border shadow-soft p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevYear}
              disabled={year === yearMin}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold px-2 min-w-[110px] text-center">
              {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextYear}
              disabled={year === yearMax}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {showToday && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedYear(currentYear)}
                className="rounded-full text-xs"
              >
                Hoy
              </Button>
            )}
          </div>
        }
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.label} className="card-gloss">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {card.label}
                    </p>
                    <p className="font-display text-2xl font-bold mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.bg} flex items-center justify-center shadow-soft`}
                  >
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}