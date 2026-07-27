import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(14,165,233,0.55)] hover:from-sky-300 hover:to-sky-500 dark:from-sky-400 dark:to-sky-600",
        destructive:
          "bg-gradient-to-b from-red-400 to-red-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:from-red-300 hover:to-red-500",
        outline:
          "border border-white/55 bg-white/40 text-foreground shadow-glass backdrop-blur-xl hover:bg-white/60 hover:border-sky-300/60 dark:border-white/15 dark:bg-white/8 dark:hover:bg-white/12",
        secondary:
          "border border-white/45 bg-white/30 text-muted-foreground shadow-glass backdrop-blur-md hover:bg-white/50 hover:text-foreground dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/8",
        mcp: "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] hover:from-emerald-300 hover:to-emerald-500",
        link: "text-sky-600 underline-offset-4 hover:underline dark:text-sky-400",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-xl px-8",
        icon: "h-9 w-9 p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
