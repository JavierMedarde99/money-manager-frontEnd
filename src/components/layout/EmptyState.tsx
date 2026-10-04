import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, hint, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "card-gloss text-center py-14 px-6 rounded-3xl shadow-soft animate-fade-up",
        className
      )}
    >
      <div className="hero-gradient mx-auto h-20 w-20 rounded-full flex items-center justify-center shadow-primary animate-float-slow">
        <Icon className="h-9 w-9 text-white" />
      </div>
      <p className="font-display text-xl font-bold mt-5 text-card-foreground">
        {title}
      </p>
      {hint && (
        <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      )}
    </div>
  );
}
