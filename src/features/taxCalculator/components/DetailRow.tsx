import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { fmt } from "../utils";

interface DetailRowProps {
  label: string;
  value: number;
  /** Bolds and highlights the row to indicate a total or summary line. */
  total?: boolean;
  /** Shows a copy-to-clipboard button next to the value. */
  copyable?: boolean;
}

/** A single label-value row inside a breakdown card. Pass `total` to bold and highlight the row. */
export function DetailRow({ label, value, total, copyable }: DetailRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`₱ ${fmt(value)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between py-2.5">
      <span
        className={cn(
          "text-sm",
          total ? "text-white font-semibold" : "text-white/55",
        )}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "font-mono text-sm",
            total ? "text-dash-green font-bold" : "text-white/75",
          )}
        >
          ₱ {fmt(value)}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-white/30 hover:text-white/70 hover:bg-white/8 transition-all duration-150 cursor-pointer"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-dash-green" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
