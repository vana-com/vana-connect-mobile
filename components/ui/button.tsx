import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0",
    "font-sans font-bold uppercase tracking-wide",
    "cursor-pointer select-none whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1em]",
    "transition-[transform,box-shadow] duration-[80ms] ease-[var(--ease-press)]",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-foreground [color:var(--background)] border-[3px] border-foreground shadow-hard-sm active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        outline:
          "bg-background text-foreground border-[3px] border-foreground shadow-hard-sm active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        ghost:
          "text-foreground border-[3px] border-transparent hover:border-foreground hover:bg-muted",
        secondary:
          "bg-muted text-foreground border-[3px] border-foreground shadow-hard-sm active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        destructive:
          "bg-sticker-red [color:var(--destructive-foreground)] border-[3px] border-foreground shadow-hard-sm active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        accent:
          "bg-electric-blue [color:var(--background)] border-[3px] border-foreground shadow-hard-sm active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        link:
          "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        xs:      "h-[28px] px-2 gap-1 text-fine",
        sm:      "h-[36px] px-3 gap-1.5 text-small",
        default: "h-button px-4 gap-2 text-button",
        lg:      "h-[54px] px-6 gap-2 text-large",
        icon:    "size-button shrink-0",
        pill:    "h-[26px] rounded-[2px] px-2 gap-1 text-fine",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
