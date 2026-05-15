"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      aria-label="Color theme"
      className="inline-flex h-10 items-center rounded-md border bg-background p-1"
      role="group"
    >
      <Button
        aria-pressed={!isDark}
        className="h-8 gap-2 px-3"
        onClick={() => setTheme("light")}
        size="sm"
        type="button"
        variant={!isDark ? "secondary" : "ghost"}
      >
        <Sun className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Light</span>
      </Button>
      <Button
        aria-pressed={isDark}
        className="h-8 gap-2 px-3"
        onClick={() => setTheme("dark")}
        size="sm"
        type="button"
        variant={isDark ? "secondary" : "ghost"}
      >
        <Moon className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Dark</span>
      </Button>
    </div>
  );
}
