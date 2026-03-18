import { useState, useEffect } from 'react';
import type { Salary, EmploymentType, TaxScheme } from './types/Salary.types';
import { UseTaxCalculator } from './hooks/UseTaxCalculator';
import { Badge } from '@/shared/components/ui/badge';
import logo from '@assets/logo.png';
import { Wallet, TrendingUp, ArrowDownCircle, CalendarDays } from 'lucide-react';
import { InputCard } from './components/InputCard';
import { BreakdownChartCard } from './components/BreakdownChartCard';
import { MetricCard } from './components/MetricCard';
import { DeductionsCard } from './components/DeductionsCard';
import { EmployerCard } from './components/EmployerCard';
import { ProjectionsCard } from './components/ProjectionsCard';

const PIE_SLICES_EMPLOYED = [
    { name: 'Basic Salary After Taxes', color: '#7EC341' },
    { name: 'Deductions',               color: '#B7EE7C' },
    { name: 'Allowances',               color: '#D8F8B4' },
];

const PIE_SLICES_SELF = [
    { name: 'Net Income', color: '#7EC341' },
    { name: 'Deductions', color: '#B7EE7C' },
];

/**
 * Renders a single Google AdSense ad unit. Requires the AdSense script to be
 * loaded in index.html and valid data-ad-client / data-ad-slot values.
 */
function AdUnit({ slot }: { slot: string }) {
    useEffect(() => {
        try {
            ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
                (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
        } catch (e) { console.log('AdSense error:', e); }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-2653517967853648"
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
}

/** Vertical ad sidebar — visible on desktop only. */
function AdColumn() {
    return (
        <aside className="hidden md:flex w-40 shrink-0 flex-col gap-4 pt-5">
            <AdUnit slot="1234567890" />
            <AdUnit slot="0987654321" />
        </aside>
    );
}

/** Horizontal ad banner — visible on mobile only. */
function AdBanner({ slot }: { slot: string }) {
    return (
        <div className="md:hidden w-full">
            <AdUnit slot={slot} />
        </div>
    );
}

/**
 * Main page component for the PH Income Tax Calculator.
 *
 * Supports two employment types:
 * - **Employed** — computes withholding tax, with SSS/PhilHealth/Pag-IBIG split between employee and employer.
 * - **Self-Employed** — covers all contributions personally; supports graduated rates or the 8% flat rate
 *   (automatically falls back to graduated if annual income exceeds the ₱3M BIR threshold).
 */
export function TaxDashboard() {
    const { IncomeTaxCalculator, SelfEmployedTaxCalculator } = UseTaxCalculator();

    const [employmentType, setEmploymentType] = useState<EmploymentType>('employed');
    const [taxScheme, setTaxScheme] = useState<TaxScheme>('graduated');
    const [incomeRaw, setIncomeRaw] = useState('');
    const [untaxableRaw, setUntaxableRaw] = useState('');
    const [result, setResult] = useState<Salary | null>(null);

    const parsedIncome = parseFloat(incomeRaw) || 0;

    // Warn when the 8% flat rate is selected but monthly income exceeds ₱250K (₱3M/year BIR limit)
    const flatRateExceeded = taxScheme === 'flat8' && parsedIncome > 250_000;

    const handleEmploymentTypeChange = (val: EmploymentType) => {
        setEmploymentType(val);
        setResult(null);
    };

    const handleTaxSchemeChange = (val: TaxScheme) => {
        setTaxScheme(val);
        setResult(null);
    };

    const handleCalculate = () => {
        if (!incomeRaw || isNaN(parsedIncome) || parsedIncome <= 0) return;

        if (employmentType === 'employed') {
            const untaxable = parseFloat(untaxableRaw) || 0;
            setResult(IncomeTaxCalculator(parsedIncome, untaxable));
        } else {
            setResult(SelfEmployedTaxCalculator(parsedIncome, taxScheme));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleCalculate();
    };

    const r = result;
    const isSelfEmployed = employmentType === 'self-employed';

    const pieSlices = isSelfEmployed ? PIE_SLICES_SELF : PIE_SLICES_EMPLOYED;
    const pieData = isSelfEmployed
        ? [
            { ...PIE_SLICES_SELF[0], value: r?.NetSalary ?? 0 },
            { ...PIE_SLICES_SELF[1], value: r?.TotalDeductions ?? 0 },
        ].filter(d => d.value > 0)
        : [
            { ...PIE_SLICES_EMPLOYED[0], value: (r?.NetSalary ?? 0) - (r?.UntaxableIncome ?? 0) },
            { ...PIE_SLICES_EMPLOYED[1], value: r?.TotalDeductions ?? 0 },
            { ...PIE_SLICES_EMPLOYED[2], value: r?.UntaxableIncome ?? 0 },
        ].filter(d => d.value > 0);

    // True when the user selected flat8 but the calculator switched to graduated due to the ₱3M threshold
    const effectiveSchemeSwitched = taxScheme === 'flat8' && r?.TaxScheme === 'graduated';

    return (
        <div className="min-h-screen bg-background-alt flex flex-col">

            <header className="flex items-center justify-between px-4 md:px-8 py-5">
                <div className="flex items-center gap-2.5">
                    <img src={logo} alt="Logo" className="h-8" />
                    <span className="text-[1.05rem] font-bold text-white tracking-tight">
                        PH Income{' '}
                        <span className="text-dash-green">Tax Calculator</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="muted" className="bg-black/10 text-[#6b6966] border-0 font-medium hover:cursor-not-allowed">
                        TRAIN Law
                    </Badge>
                    <Badge variant="muted" className="bg-black/10 text-[#6b6966] border-0 font-medium hover:cursor-not-allowed">
                        2025 Tax Tables
                    </Badge>
                </div>
            </header>

            <AdBanner slot="1111111111" />

            <div className="flex gap-5 px-2 md:px-5 flex-1">
                <AdColumn />

                <main className="flex-1 min-w-0 pb-12 space-y-5">

                    <div className="flex gap-5 flex-wrap">
                        <InputCard
                            employmentType={employmentType}
                            taxScheme={taxScheme}
                            incomeRaw={incomeRaw}
                            untaxableRaw={untaxableRaw}
                            parsedIncome={parsedIncome}
                            flatRateExceeded={flatRateExceeded}
                            onEmploymentTypeChange={handleEmploymentTypeChange}
                            onTaxSchemeChange={handleTaxSchemeChange}
                            onIncomeChange={setIncomeRaw}
                            onUntaxableChange={setUntaxableRaw}
                            onCalculate={handleCalculate}
                            onKeyDown={handleKeyDown}
                        />
                        <BreakdownChartCard pieData={pieData} pieSlices={pieSlices} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                        <MetricCard
                            label={isSelfEmployed ? 'Net Income' : 'Net Salary'}
                            value={r?.NetSalary ?? 0}
                            sub="Monthly take-home pay"
                            icon={<Wallet className="w-4 h-4" />}
                            accent
                        />
                        <MetricCard
                            label={isSelfEmployed ? 'Gross Income' : 'Gross Salary'}
                            value={r?.GrossSalary ?? 0}
                            sub="Before deductions"
                            icon={<TrendingUp className="w-4 h-4" />}
                        />
                        <MetricCard
                            label="Total Deductions"
                            value={r?.TotalDeductions ?? 0}
                            sub="Gov't contributions + tax"
                            icon={<ArrowDownCircle className="w-4 h-4" />}
                        />
                        <MetricCard
                            label={isSelfEmployed ? 'Annual Net Income' : 'Annual Net Salary'}
                            value={r?.AnnualNetSalary ?? 0}
                            sub="Projected yearly take-home"
                            icon={<CalendarDays className="w-4 h-4" />}
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        <DeductionsCard
                            result={r}
                            isSelfEmployed={isSelfEmployed}
                            effectiveSchemeSwitched={effectiveSchemeSwitched}
                        />
                        <EmployerCard result={r} isSelfEmployed={isSelfEmployed} />
                        <ProjectionsCard result={r} isSelfEmployed={isSelfEmployed} />
                    </div>

                </main>

                <AdColumn />
            </div>

            <AdBanner slot="2222222222" />

            <footer className="border-t border-white/6 mt-4 px-4 md:px-8 py-8">
                <div className="max-w-4xl mx-auto space-y-3 text-center">
                    <p className="text-[0.72rem] text-white/35 leading-relaxed">
                        <span className="text-white/50 font-semibold">Disclaimer:</span> This calculator is intended for general informational and estimation purposes only.
                        Results are based on the Philippine TRAIN Law (Republic Act No. 10963) tax tables and government contribution schedules
                        (SSS, PhilHealth, and Pag-IBIG) as updated in <span className="text-white/50">March 2026</span>.
                        Contribution rates and tax brackets are subject to change by the respective government agencies.
                    </p>
                    <p className="text-[0.72rem] text-white/30 leading-relaxed">
                        This tool does not constitute professional tax, financial, or legal advice. For official computations, complex tax situations,
                        or filing requirements, consult the <span className="text-white/45">Bureau of Internal Revenue (BIR)</span> or a licensed Certified Public Accountant (CPA).
                        The developer assumes no liability for any decisions made based on the results produced by this calculator.
                    </p>
                    <p className="text-[0.65rem] text-white/20">
                        Data last updated: March 2026 &nbsp;·&nbsp; PH Income Tax Calculator &nbsp;·&nbsp; For personal use only
                    </p>
                </div>
            </footer>

        </div>
    );
}
