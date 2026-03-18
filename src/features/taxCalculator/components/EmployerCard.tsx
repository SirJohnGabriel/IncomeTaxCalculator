import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Building2, Briefcase } from 'lucide-react';
import type { Salary } from '../types/Salary.types';
import { DetailRow } from './DetailRow';

interface EmployerCardProps {
    result: Salary | null;
    /** When true, renders an informational placeholder instead of contribution figures. */
    isSelfEmployed: boolean;
}

/**
 * Shows employer-side contributions (PhilHealth + SSS) for employed users.
 * For self-employed users, renders an informational card explaining that they
 * cover both shares themselves (shown in the Deductions card instead).
 */
export function EmployerCard({ result: r, isSelfEmployed }: EmployerCardProps) {
    if (!isSelfEmployed) {
        return (
            <Card className="flex-1 min-w-55 bg-card border-white/5">
                <CardHeader className="px-6 pt-6 pb-0">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-dash-green" />
                        <CardTitle className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
                            Employer Contributions
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-3">
                    <DetailRow label="PhilHealth" value={r?.PhilhealthEmployerContribution ?? 0} />
                    <Separator className="bg-white/6" />
                    <DetailRow label="SSS" value={r?.SssEmployerContribution ?? 0} />
                    <Separator className="bg-white/15 my-1" />
                    <DetailRow label="Total Contributions" value={r?.EmployerContributions ?? 0} total />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex-1 min-w-55 bg-card border-white/5 flex flex-col justify-center">
            <CardContent className="px-6 py-8 flex flex-col items-center text-center gap-2">
                <Briefcase className="w-8 h-8 text-white/10" />
                <p className="text-white/30 text-sm font-medium">No Employer Contributions</p>
                <p className="text-white/20 text-xs leading-relaxed">
                    As a self-employed individual, you cover both your own and the employer share of SSS, PhilHealth, and Pag-IBIG.
                </p>
            </CardContent>
        </Card>
    );
}
