import { cn } from "@/lib/utils";

export function CandyLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center py-16", className)}
      role="status"
      aria-label="Cargando"
    >
      <div className="candy-loader" />
    </div>
  );
}
