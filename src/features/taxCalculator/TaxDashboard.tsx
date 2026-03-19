import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import type { Salary, EmploymentType, TaxScheme } from './types/Salary.types';
import { UseTaxCalculator } from './hooks/UseTaxCalculator';
import { Wallet, TrendingUp, ArrowDownCircle, CalendarDays } from 'lucide-react';
import { InputCard } from './components/InputCard';
import { BreakdownChartCard } from './components/BreakdownChartCard';
import { MetricCard } from './components/MetricCard';
import { DeductionsCard } from './components/DeductionsCard';
import { EmployerCard } from './components/EmployerCard';
import { ProjectionsCard } from './components/ProjectionsCard';
import { Header } from '@/shared/components/Header';

const PIE_SLICES_EMPLOYED = [
    { name: 'Basic Salary After Taxes', color: '#7EC341' },
    { name: 'Deductions', color: '#B7EE7C' },
    { name: 'Allowances', color: '#D8F8B4' },
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
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ||
        []).push({});
    } catch (e) {
      console.log("AdSense error:", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
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

    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const [employmentType, setEmploymentType] = useState<EmploymentType>('employed');
    const [taxScheme, setTaxScheme] = useState<TaxScheme>('graduated');
    const [incomeRaw, setIncomeRaw] = useState('');
    const [untaxableRaw, setUntaxableRaw] = useState('');
    const [result, setResult] = useState<Salary | null>(null);
    const [lastCalcSnapshot, setLastCalcSnapshot] = useState<{
        incomeRaw: string;
        untaxableRaw: string;
        employmentType: EmploymentType;
        taxScheme: TaxScheme;
    } | null>(null);

    const parsedIncome = parseFloat(incomeRaw) || 0;

    const isUnchanged = lastCalcSnapshot !== null &&
        lastCalcSnapshot.incomeRaw === incomeRaw &&
        lastCalcSnapshot.untaxableRaw === untaxableRaw &&
        lastCalcSnapshot.employmentType === employmentType &&
        lastCalcSnapshot.taxScheme === taxScheme;

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
        setLastCalcSnapshot({ incomeRaw, untaxableRaw, employmentType, taxScheme });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleCalculate();
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
        <div className={`min-h-screen bg-background-alt flex flex-col${isDark ? '' : ' light'}`}>
            <Helmet>
                <title>Philippine Income Tax Calculator 2026 | BIR, SSS, PhilHealth, Pag-IBIG</title>
                <meta name="description" content="Free Philippine income tax calculator for 2026. Compute your BIR withholding tax, net take-home pay, SSS, PhilHealth, and Pag-IBIG contributions instantly. For employed and self-employed individuals." />
                <link rel="canonical" href="https://taxphincomecalculator.netlify.app/" />
                <meta property="og:title" content="Philippine Income Tax Calculator 2026" />
                <meta property="og:description" content="Free Philippine income tax calculator. Compute BIR withholding tax, SSS, PhilHealth, Pag-IBIG, and take-home pay instantly." />
                <meta property="og:url" content="https://taxphincomecalculator.netlify.app/" />
            </Helmet>

            <Header isDark={isDark} onThemeToggle={() => setIsDark(d => !d)} />

            <AdBanner slot="1111111111" />

            <div className="flex gap-5 px-2 md:px-5 flex-1">
                <AdColumn />

                <main className="flex-1 min-w-0 pb-12 space-y-5">

                    {/* ── SEO hero text ── */}
                    <div className="pt-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                            Philippine Income Tax Calculator{' '}
                            <span className="text-dash-green">2026</span>
                        </h1>
                        <p className="text-white/45 text-sm mt-2 max-w-2xl leading-relaxed">
                            Compute your Philippine income tax, SSS, PhilHealth, and Pag-IBIG contributions
                            instantly. This calculator uses the latest BIR tax rates under the TRAIN Law
                            (RA 10963) and updated 2025 contribution schedules to estimate your monthly
                            take-home pay — for both employed and self-employed individuals.
                        </p>
                    </div>

                    <div className="flex gap-5 flex-wrap">
                        <InputCard
                            employmentType={employmentType}
                            taxScheme={taxScheme}
                            incomeRaw={incomeRaw}
                            untaxableRaw={untaxableRaw}
                            parsedIncome={parsedIncome}
                            flatRateExceeded={flatRateExceeded}
                            isUnchanged={isUnchanged}
                            onEmploymentTypeChange={handleEmploymentTypeChange}
                            onTaxSchemeChange={handleTaxSchemeChange}
                            onIncomeChange={setIncomeRaw}
                            onUntaxableChange={setUntaxableRaw}
                            onCalculate={handleCalculate}
                            onKeyDown={handleKeyDown}
                        />
                        <BreakdownChartCard pieData={pieData} pieSlices={pieSlices} isDark={isDark} />
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

                    {/* ── SEO content section ── */}
                    <section className="border-t border-white/6 pt-8 space-y-8 max-w-3xl">

                        <div>
                            <h2 className="text-base font-semibold text-white mb-2">
                                How to Compute Income Tax in the Philippines
                            </h2>
                            <p className="text-white/45 text-sm leading-relaxed">
                                Under the TRAIN Law, Philippine income tax is computed using a graduated tax table
                                based on your annual taxable income. Your monthly basic salary is first reduced by
                                mandatory government contributions (SSS, PhilHealth, Pag-IBIG), and the resulting
                                taxable income is applied against the BIR withholding tax brackets. This calculator
                                handles all of that automatically — just enter your gross monthly salary and
                                non-taxable allowances to get your estimated take-home pay.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-white mb-2">
                                2025 BIR Tax Rates (TRAIN Law)
                            </h2>
                            <p className="text-white/45 text-sm leading-relaxed">
                                Employees earning up to ₱250,000 annually are exempt from income tax.
                                Income above that is taxed at progressive rates ranging from 15% to 35%.
                                For self-employed individuals with annual gross receipts not exceeding ₱3,000,000,
                                the optional 8% flat tax rate on gross income (in excess of ₱250,000) may be
                                available as an alternative to the graduated rates.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-white mb-2">
                                SSS, PhilHealth, and Pag-IBIG Contributions
                            </h2>
                            <p className="text-white/45 text-sm leading-relaxed">
                                Mandatory government contributions are deducted from your gross salary before
                                tax is computed. PhilHealth contribution is 5% of monthly salary (split equally
                                between employee and employer, capped at ₱5,000 total). SSS contributions follow
                                a contribution table based on salary brackets. Pag-IBIG (HDMF) is 1% of salary
                                for employees earning up to ₱1,500, and 2% above that, capped at ₱200/month
                                for the employee share.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-white mb-2">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-white/70 mb-1">
                                        Is this calculator accurate for 2025?
                                    </h3>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        Yes. This tool uses the BIR withholding tax table effective for 2023 onwards
                                        under the TRAIN Law, along with the latest SSS, PhilHealth, and Pag-IBIG
                                        contribution schedules as of 2025. Results are estimates — consult a CPA
                                        for official tax computations.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white/70 mb-1">
                                        What are non-taxable allowances?
                                    </h3>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        Non-taxable allowances include de minimis benefits such as rice allowance,
                                        transportation allowance, clothing allowance, and similar benefits up to
                                        BIR-prescribed limits. These are excluded from your taxable income, reducing
                                        your withholding tax.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white/70 mb-1">
                                        What is the difference between employed and self-employed computation?
                                    </h3>
                                    <p className="text-white/40 text-sm leading-relaxed">
                                        Employed individuals have their SSS and PhilHealth contributions split
                                        with their employer. Self-employed individuals cover all contributions
                                        on their own and may choose between the graduated tax rates or the
                                        optional 8% flat rate if their annual gross income does not exceed ₱3,000,000.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </section>

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
