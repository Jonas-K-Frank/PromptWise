import { ShieldCheck, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <WandSparkles className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-tight">
              PromptWise
            </p>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Safer, clearer prompt coaching
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="hidden gap-1.5 sm:inline-flex" variant="secondary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Responsible AI
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
