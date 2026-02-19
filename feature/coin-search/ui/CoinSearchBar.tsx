import { cn } from "@/shared/lib/utils";
import { Search } from "lucide-react";
import React from "react";

const CoinSearchBar = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-[90%]">
        <input
          placeholder="코인명 검색"
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-3xl border bg-transparent pl-9 pr-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className,
          )}
          {...props}
        />
        <Search className="absolute top-1/2 -translate-1/2 left-5 w-5 h-5" />
      </div>
    </div>
  );
});

export default CoinSearchBar;
