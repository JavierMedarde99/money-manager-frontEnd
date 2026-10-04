import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconClass?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconClass = "bg-primary-100 text-primary",
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between flex-wrap gap-4 animate-fade-up",
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div
            className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center shadow-soft shrink-0",
              iconClass
            )}
          >
            <Icon className="h-7 w-7" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      )}
    </div>
  );
}
