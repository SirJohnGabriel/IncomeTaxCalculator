import { cn } from '@/shared/lib/utils';
import { fmt } from '../utils';

interface DetailRowProps {
    label: string;
    value: number;
    /** Bolds and highlights the row to indicate a total or summary line. */
    total?: boolean;
}

/** A single label-value row inside a breakdown card. Pass `total` to bold and highlight the row. */
export function DetailRow({ label, value, total }: DetailRowProps) {
    return (
        <div className="flex items-center justify-between py-2.5">
            <span className={cn('text-sm', total ? 'text-white font-semibold' : 'text-white/55')}>
                {label}
            </span>
            <span className={cn('font-mono text-sm', total ? 'text-dash-green-bright font-bold' : 'text-white/75')}>
                ₱ {fmt(value)}
            </span>
        </div>
    );
}
