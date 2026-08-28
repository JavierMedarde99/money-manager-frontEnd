import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function Toggle({
  checked,
  onCheckedChange,
  disabled,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked
          ? "bg-primary shadow-primary"
          : "bg-primary-200 border-2 border-primary-300",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300",
          checked ? "translate-x-[30px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}

export { Toggle };