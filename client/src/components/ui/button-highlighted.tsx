import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonHighlightedVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
        outline:
          "border border-primary text-primary bg-white hover:bg-neutral-lightest shadow-sm",
        white:
          "bg-white text-primary hover:bg-neutral-50 shadow-md",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-12 px-8 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonHighlightedProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonHighlightedVariants> {
  asChild?: boolean;
}

const ButtonHighlighted = React.forwardRef<HTMLButtonElement, ButtonHighlightedProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonHighlightedVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonHighlighted.displayName = "ButtonHighlighted";

export { ButtonHighlighted, buttonHighlightedVariants };
