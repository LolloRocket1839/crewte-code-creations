import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border-2 border-foreground bg-background px-4 py-2 font-mono text-base ring-offset-background transition-all duration-100",
          "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground",
          "placeholder:text-muted-foreground placeholder:uppercase placeholder:tracking-wide",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "focus-visible:shadow-brutal-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "touch-target",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
