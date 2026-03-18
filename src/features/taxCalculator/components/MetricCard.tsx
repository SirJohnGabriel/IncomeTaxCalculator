import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { fmt } from '../utils';

interface MetricCardProps {
    label: string;
    value: number;
    sub: string;
    icon: React.ReactNode;
    /** Highlights the card with a green top border and bright value text. */
    accent?: boolean;
}

/** Summary metric card displayed in the top row of results. */
export function MetricCard({ label, value, sub, icon, accent }: MetricCardProps) {
    return (
        <Card className={cn(
            'flex-1 min-w-0 bg-card-alt border-white/5',
            accent && 'border-t-2 border-t-dash-green'
        )}>
            <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/50">
                        {label}
                    </span>
                    <span className={cn('opacity-60', accent ? 'text-dash-green' : 'text-white/40')}>
                        {icon}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <p className={cn(
                    'text-2xl font-bold font-mono leading-tight',
                    accent ? 'text-dash-green-bright' : 'text-white'
                )}>
                    ₱ {fmt(value)}
                </p>
                <p className="text-[0.72rem] text-white/40 mt-1">{sub}</p>
            </CardContent>
        </Card>
    );
}
