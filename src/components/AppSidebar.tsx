import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { indicatorSpring } from "@/lib/motion";
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
        "relative z-40 flex h-full w-[220px] shrink-0 flex-col",
        "border-r border-white/45 dark:border-white/10",
        "bg-white/40 backdrop-blur-2xl dark:bg-white/[0.04]",
        "shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.35)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -right-12 bottom-20 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
      </div>

      <div className="relative flex h-full flex-col px-3 pb-3 pt-4">
        <motion.div
          className="mb-4 px-1"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {brand}
        </motion.div>

        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-1.5 px-2 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
            {appsLabel}
          </p>
          {apps}
        </motion.div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-1.5 px-2 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
            {navLabel}
          </p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.22,
                  delay: 0.06 + index * 0.03,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {item.active && (
                  <motion.div
                    layoutId="sidebar-nav-active"
                    className="absolute inset-0 rounded-xl border border-white/60 bg-white/70 shadow-glass dark:border-white/15 dark:bg-white/10"
                    transition={indicatorSpring}
                  />
                )}
                <Button
                  variant="ghost"
                  onClick={item.onClick}
                  title={item.title ?? item.label}
                  className={cn(
                    "relative z-10 h-9 w-full justify-start gap-2.5 rounded-xl px-2.5 text-sm font-medium",
                    item.active
                      ? "bg-transparent text-foreground"
                      : "text-muted-foreground hover:bg-white/40 hover:text-foreground dark:hover:bg-white/8",
                  )}
                >
                  <span className="flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </nav>
        </div>

        <div className="mt-3 border-t border-white/40 pt-3 dark:border-white/10">
          {footer}
        </div>
      </div>
    </aside>
  );
}
