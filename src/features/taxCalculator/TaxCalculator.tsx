import { useState } from 'react';
import type { Salary } from './types/Salary.types';
import { UseTaxCalculator } from './hooks/UseTaxCalculator';

function fmt(value: number) {
    return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface BreakdownRowProps {
    label: string;
    value: number;
    highlight?: boolean;
    muted?: boolean;
}

function BreakdownRow({ label, value, highlight, muted }: BreakdownRowProps) {
    return (
        <div className={`flex justify-between py-2 px-3 rounded ${highlight ? 'bg-primary font-semibold text-gray-100 opacity-75' : 'text-gray-400'} ${muted ? 'text-gray-400' : ''}`}>
            <span>{label}</span>
            <span className="font-mono text-gray-300">₱ {fmt(value)}</span>
        </div>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
    return (
        <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100 mb-1 px-1">{title}</h3>
            <div className="divide-y divide-gray-400 border border-gray-400 rounded-lg overflow-hidden">
                {children}
            </div>
        </div>
    );
}

export function TaxCalculator() {
    const { IncomeTaxCalculator } = UseTaxCalculator();

    const [salaryInput, setSalaryInput] = useState('');
    const [untaxableInput, setUntaxableInput] = useState('');
    const [result, setResult] = useState<Salary | null>(null);

    const handleNumberInput = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val))
            setter(val);
    };

    const handleCalculate = () => {
        const salary = parseFloat(salaryInput);
        const untaxable = parseFloat(untaxableInput) || 0;

        if (!salaryInput || isNaN(salary) || salary < 0) return;

        setResult(IncomeTaxCalculator(salary, untaxable));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleCalculate();
    };

    return (
        <div className="max-w-xl mx-auto px-4 pb-10 bg-background">
            {/* <h2 className="text-2xl font-bold text-white mb-6">Income Tax Calculator</h2> */}

            {/* Inputs */}
            <div className="bg-secondary border border-secondary-400 rounded-xl p-5 mb-6 shadow-sm">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-100 mb-1">
                        Monthly Basic Salary
                    </label>
                    <div className="flex items-center border border-gray-400 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                        <span className="px-3 text-gray-300 select-none">₱</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={salaryInput}
                            onChange={handleNumberInput(setSalaryInput)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 py-2 pr-3 outline-none text-gray-400"
                        />
                    </div>
                </div>

                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-100 mb-1">
                        Non-taxable Allowances <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="flex items-center border border-gray-400 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                        <span className="px-3 text-gray-300 select-none">₱</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={untaxableInput}
                            onChange={handleNumberInput(setUntaxableInput)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 py-2 pr-3 outline-none text-gray-400"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    disabled={!salaryInput}
                    className="w-full bg-primary hover:bg-primary-500 hover:cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                    Calculate
                </button>
            </div>

            {/* Breakdown */}
            {result && (
                <div className="bg-secondary border border-secondary-400 rounded-xl p-5 shadow-sm">
                    <Section title="Salary Summary">
                        <BreakdownRow label="Basic Salary" value={result.AnnualSalary / 12} />
                        <BreakdownRow label="Non-taxable Allowances" value={result.UntaxableIncome} muted={result.UntaxableIncome === 0} />
                        <BreakdownRow label="Gross Salary" value={result.GrossSalary} />
                        <BreakdownRow label="Net Salary (Take-home)" value={result.NetSalary} highlight />
                    </Section>

                    <Section title="Deductions (Employee)">
                        <BreakdownRow label="PhilHealth" value={result.PhilhealthEmployeeContribution} />
                        <BreakdownRow label="SSS" value={result.SssEmployeeContribution} />
                        <BreakdownRow label="Pag-IBIG" value={result.PagibigContribution} />
                        <BreakdownRow label="Withholding Tax (BIR)" value={result.BirContribution} />
                        <BreakdownRow label="Total Deductions" value={result.TotalDeductions} highlight />
                    </Section>

                    <Section title="Employer Contributions">
                        <BreakdownRow label="PhilHealth" value={result.PhilhealthEmployerContribution} />
                        <BreakdownRow label="SSS" value={result.SssEmployerContribution} />
                        <BreakdownRow label="Total Employer Contributions" value={result.EmployerContributions} highlight />
                    </Section>

                    <Section title="Annual Projections">
                        <BreakdownRow label="Annual Gross Salary" value={result.AnnualGrossSalary} />
                        <BreakdownRow label="Annual Net Salary" value={result.AnnualNetSalary} highlight />
                    </Section>
                </div>
            )}
        </div>
    );
}
