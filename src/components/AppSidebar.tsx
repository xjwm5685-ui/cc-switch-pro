import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick: () => void;
  title?: string;
}

interface AppSidebarProps {
  brand: ReactNode;
  apps: ReactNode;
  navItems: SidebarNavItem[];
  footer: ReactNode;
  appsLabel?: string;
  navLabel?: string;
  className?: string;
}

export function AppSidebar({
  brand,
  apps,
  navItems,
  footer,
  appsLabel = "Apps",
  navLabel = "Navigate",
  className,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-[220px] shrink-0 flex-col border-r border-border/80",
        "bg-[hsl(var(--muted)/0.35)] dark:bg-[hsl(var(--muted)/0.25)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -right-10 bottom-24 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative flex h-full flex-col px-3 pb-3 pt-4">
        <div className="mb-4 px-1">{brand}</div>

        <div className="mb-4">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {appsLabel}
          </p>
          {apps}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {navLabel}
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={item.onClick}
                title={item.title ?? item.label}
                className={cn(
                  "h-9 w-full justify-start gap-2.5 rounded-lg px-2.5 text-sm font-medium",
                  item.active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
              >
                <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-3 border-t border-border/70 pt-3">{footer}</div>
      </div>
    </aside>
  );
}
