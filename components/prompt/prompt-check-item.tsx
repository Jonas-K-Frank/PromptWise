import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckState = "passed" | "warning" | "failed";

interface PromptCheckItemProps {
  label: string;
  state: CheckState;
}

const config: Record<
  CheckState,
  { icon: typeof CheckCircle2; className: string; labelClass: string }
> = {
  passed: {
    icon: CheckCircle2,
    className: "text-primary",
    labelClass: ""
  },
  warning: {
    icon: AlertTriangle,
    className: "text-amber-500",
    labelClass: "text-muted-foreground"
  },
  failed: {
    icon: XCircle,
    className: "text-destructive",
    labelClass: "text-muted-foreground"
  }
};

export function PromptCheckItem({ label, state }: PromptCheckItemProps) {
  const { icon: Icon, className, labelClass } = config[state];

  return (
    <li className="flex items-center gap-2.5 py-1">
      <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", className)} />
      <span className={cn("text-sm", labelClass)}>{label}</span>
    </li>
  );
}
