import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative h-7 w-7 rounded-[10px] bg-foreground flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/40 to-primary opacity-90" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative h-4 w-4 text-white"
        >
          <path
            d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v10M3 7l9 5 9-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="font-display text-[19px] font-medium tracking-tight">
        Lumen
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
