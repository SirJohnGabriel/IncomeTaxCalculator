import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { fmt } from '../utils';

interface PieSlice {
    name: string;
    color: string;
}

interface PieDataEntry extends PieSlice {
    value: number;
}

interface BreakdownChartCardProps {
    pieData: PieDataEntry[];
    pieSlices: PieSlice[];
    isDark: boolean;
}

/**
 * Donut pie chart card showing the income breakdown (net pay, deductions, allowances).
 * Renders an empty state when no data is available.
 */
export function BreakdownChartCard({ pieData, pieSlices, isDark }: BreakdownChartCardProps) {
    const hasData = pieData.length > 0;

    return (
        <Card className="flex-[1.2] min-w-70 bg-card border-white/5 flex flex-col">
            <CardHeader className="pb-2 px-6 pt-6">
                <div className="flex items-center gap-2 mb-1">
                    <PieChartIcon className="w-3.5 h-3.5 text-dash-green" />
                    <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/45">
                        Income Breakdown
                    </span>
                </div>
                <CardTitle className="text-white text-base font-semibold">
                    Where your money goes
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 flex-1 flex items-center justify-center">
                {hasData ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                dataKey="value"
                            >
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} stroke="transparent" />
                                ))}
                            </Pie>
                            {/*
                             * Percentage is derived from pieData directly rather than from
                             * Recharts' internal `percent` field, which is unreliable across versions.
                             */}
                            <Tooltip content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const { name, value } = payload[0] as { name: string; value: number };
                                const total = pieData.reduce((s, d) => s + d.value, 0);
                                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                return (
                                    <div className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
                                        <p className="text-white/60 mb-0.5">{name}</p>
                                        <p className="text-white font-mono font-bold">₱ {fmt(value)}</p>
                                        <p className="text-dash-green">{pct}%</p>
                                    </div>
                                );
                            }} />
                            <Legend
                                content={() => (
                                    <ul style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', margin: 0, padding: 0, listStyle: 'none' }}>
                                        {pieSlices.filter(s => pieData.some(d => d.name === s.name)).map(s => (
                                            <li key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                                                <span style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.65)', fontSize: '0.72rem' }}>{s.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <PieChartIcon className="w-10 h-10 text-white/10" />
                        <p className="text-white/25 text-sm">Enter an income and calculate to see the breakdown</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
