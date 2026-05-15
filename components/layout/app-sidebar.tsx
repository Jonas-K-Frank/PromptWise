import {
  BarChart3,
  BookOpenText,
  Building2,
  ClipboardList,
  FileStack,
  History,
  ShieldCheck,
  WandSparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: BarChart3, active: true },
  { label: "Prompt Review", icon: WandSparkles },
  { label: "Templates", icon: FileStack },
  { label: "Policy Center", icon: ShieldCheck },
  { label: "Audit History", icon: History },
  { label: "Playbooks", icon: BookOpenText }
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <WandSparkles className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">PromptWise</p>
          <p className="truncate text-xs text-muted-foreground">
            Enterprise prompt coaching
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {navItems.map((item) => (
          <Button
            className={cn(
              "h-10 w-full justify-start gap-3 px-3",
              item.active && "bg-secondary text-secondary-foreground"
            )}
            key={item.label}
            variant="ghost"
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="space-y-4 border-t p-4">
        <div className="rounded-lg border bg-background p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">Workspace</p>
            </div>
            <Badge variant="secondary">Pro</Badge>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Marketing Ops
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-muted p-2">
              <p className="font-medium">24</p>
              <p className="text-muted-foreground">reviews</p>
            </div>
            <div className="rounded-md bg-muted p-2">
              <p className="font-medium">96%</p>
              <p className="text-muted-foreground">safe</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ClipboardList className="size-4" aria-hidden="true" />
            SOC2 policy set
          </div>
          <Badge variant="outline">Active</Badge>
        </div>
      </div>
    </aside>
  );
}
