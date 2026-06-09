import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "bg-slate-900 text-white hover:bg-slate-800 px-4 py-2",
        className,
      )}
      {...props}
    />
  );
}
