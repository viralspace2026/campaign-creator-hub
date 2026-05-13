import { BarChart3, Megaphone, ClipboardList, ListChecks } from "lucide-react";
import { actionMeta, type ActionType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const icons = { BarChart3, Megaphone, ClipboardList, ListChecks } as const;

interface Props {
  type: ActionType;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ActionTile({ type, onClick, selected, size = "md", className }: Props) {
  const meta = actionMeta[type];
  const Icon = icons[meta.icon as keyof typeof icons];
  const sizing = {
    sm: "px-3 py-2 text-sm gap-2",
    md: "px-4 py-3 text-base gap-3",
    lg: "px-5 py-4 text-lg gap-3",
  }[size];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center rounded-xl font-semibold transition-all",
        "hover:-translate-y-0.5 hover:shadow-sm",
        meta.bg,
        meta.fg,
        selected && "ring-2 ring-offset-2 ring-current",
        sizing,
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={2.25} />
      {meta.label}
    </button>
  );
}
