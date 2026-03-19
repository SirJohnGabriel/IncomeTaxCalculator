import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/shared/components/Header';
import { FileText, Heart, Home, Shield } from 'lucide-react';

// ── Formatters ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtRange = (n: number) =>
    n % 1 === 0
        ? n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        : n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Reference Data ─────────────────────────────────────────────────────────────

const BIR_BRACKETS = [
    { range: '₱0 – ₱250,000',               baseTax: 0,        rate: '0%',  excessOver: null    },
    { range: '₱250,001 – ₱400,000',          baseTax: 0,        rate: '15%', excessOver: 250000  },
    { range: '₱400,001 – ₱800,000',          baseTax: 22500,    rate: '20%', excessOver: 400000  },
    { range: '₱800,001 – ₱2,000,000',        baseTax: 102500,   rate: '25%', excessOver: 800000  },
    { range: '₱2,000,001 – ₱8,000,000',      baseTax: 402500,   rate: '30%', excessOver: 2000000 },
    { range: 'Over ₱8,000,000',              baseTax: 2202500,  rate: '35%', excessOver: 8000000 },
];

const PHILHEALTH_ROWS = [
    { range: 'Below ₱10,000',          rate: '5%', ee: '₱250.00',        er: '₱250.00',        total: '₱500.00'      },
    { range: '₱10,000 – ₱99,999.99',   rate: '5%', ee: '2.5% of salary', er: '2.5% of salary', total: '5% of salary' },
    { range: '₱100,000 and above',     rate: '5%', ee: '₱2,500.00',      er: '₱2,500.00',      total: '₱5,000.00'    },
];

const PAGIBIG_ROWS = [
    { range: '₱1,500 and below', ee: '1%', er: '2%', maxEe: '₱15.00'  },
    { range: 'Over ₱1,500',      ee: '2%', er: '2%', maxEe: '₱200.00' },
];

const SSS_ROWS = [
    { from: 0,     to: 5249.99,  msc: 5000,  ee: 250,  er: 500,  total: 760  },
    { from: 5250,  to: 5749.99,  msc: 5500,  ee: 275,  er: 550,  total: 835  },
    { from: 5750,  to: 6249.99,  msc: 6000,  ee: 300,  er: 600,  total: 910  },
    { from: 6250,  to: 6749.99,  msc: 6500,  ee: 325,  er: 650,  total: 985  },
    { from: 6750,  to: 7249.99,  msc: 7000,  ee: 350,  er: 700,  total: 1060 },
    { from: 7250,  to: 7749.99,  msc: 7500,  ee: 375,  er: 750,  total: 1135 },
    { from: 7750,  to: 8249.99,  msc: 8000,  ee: 400,  er: 800,  total: 1210 },
    { from: 8250,  to: 8749.99,  msc: 8500,  ee: 425,  er: 850,  total: 1285 },
    { from: 8750,  to: 9249.99,  msc: 9000,  ee: 450,  er: 900,  total: 1360 },
    { from: 9250,  to: 9749.99,  msc: 9500,  ee: 475,  er: 950,  total: 1435 },
    { from: 9750,  to: 10249.99, msc: 10000, ee: 500,  er: 1000, total: 1510 },
    { from: 10250, to: 10749.99, msc: 10500, ee: 525,  er: 1050, total: 1585 },
    { from: 10750, to: 11249.99, msc: 11000, ee: 550,  er: 1100, total: 1660 },
    { from: 11250, to: 11749.99, msc: 11500, ee: 575,  er: 1150, total: 1735 },
    { from: 11750, to: 12249.99, msc: 12000, ee: 600,  er: 1200, total: 1810 },
    { from: 12250, to: 12749.99, msc: 12500, ee: 625,  er: 1250, total: 1885 },
    { from: 12750, to: 13249.99, msc: 13000, ee: 650,  er: 1300, total: 1960 },
    { from: 13250, to: 13749.99, msc: 13500, ee: 675,  er: 1350, total: 2035 },
    { from: 13750, to: 14249.99, msc: 14000, ee: 700,  er: 1400, total: 2110 },
    { from: 14250, to: 14749.99, msc: 14500, ee: 725,  er: 1450, total: 2185 },
    { from: 14750, to: 15249.99, msc: 15000, ee: 750,  er: 1500, total: 2280 },
    { from: 15250, to: 15749.99, msc: 15500, ee: 775,  er: 1550, total: 2355 },
    { from: 15750, to: 16249.99, msc: 16000, ee: 800,  er: 1600, total: 2430 },
    { from: 16250, to: 16749.99, msc: 16500, ee: 825,  er: 1650, total: 2505 },
    { from: 16750, to: 17249.99, msc: 17000, ee: 850,  er: 1700, total: 2580 },
    { from: 17250, to: 17749.99, msc: 17500, ee: 875,  er: 1750, total: 2655 },
    { from: 17750, to: 18249.99, msc: 18000, ee: 900,  er: 1800, total: 2730 },
    { from: 18250, to: 18749.99, msc: 18500, ee: 925,  er: 1850, total: 2805 },
    { from: 18750, to: 19249.99, msc: 19000, ee: 950,  er: 1900, total: 2880 },
    { from: 19250, to: 19749.99, msc: 19500, ee: 975,  er: 1950, total: 2955 },
    { from: 19750, to: 20249.99, msc: 20000, ee: 1000, er: 2000, total: 3030 },
    { from: 20250, to: 20749.99, msc: 20000, ee: 1025, er: 2050, total: 3105 },
    { from: 20750, to: 21249.99, msc: 20000, ee: 1050, er: 2100, total: 3180 },
    { from: 21250, to: 21749.99, msc: 20000, ee: 1075, er: 2150, total: 3255 },
    { from: 21750, to: 22249.99, msc: 20000, ee: 1100, er: 2200, total: 3330 },
    { from: 22250, to: 22749.99, msc: 20000, ee: 1125, er: 2250, total: 3405 },
    { from: 22750, to: 23249.99, msc: 20000, ee: 1150, er: 2300, total: 3480 },
    { from: 23250, to: 23749.99, msc: 20000, ee: 1175, er: 2350, total: 3555 },
    { from: 23750, to: 24249.99, msc: 20000, ee: 1200, er: 2400, total: 3630 },
    { from: 24250, to: 24749.99, msc: 20000, ee: 1225, er: 2450, total: 3705 },
    { from: 24750, to: 25249.99, msc: 20000, ee: 1250, er: 2500, total: 3780 },
    { from: 25250, to: 25749.99, msc: 20000, ee: 1275, er: 2550, total: 3855 },
    { from: 25750, to: 26249.99, msc: 20000, ee: 1300, er: 2600, total: 3930 },
    { from: 26250, to: 26749.99, msc: 20000, ee: 1325, er: 2650, total: 4005 },
    { from: 26750, to: 27249.99, msc: 20000, ee: 1350, er: 2700, total: 4080 },
    { from: 27250, to: 27749.99, msc: 20000, ee: 1375, er: 2750, total: 4155 },
    { from: 27750, to: 28249.99, msc: 20000, ee: 1400, er: 2800, total: 4230 },
    { from: 28250, to: 28749.99, msc: 20000, ee: 1425, er: 2850, total: 4305 },
    { from: 28750, to: 29249.99, msc: 20000, ee: 1450, er: 2900, total: 4380 },
    { from: 29250, to: 29749.99, msc: 20000, ee: 1475, er: 2950, total: 4455 },
    { from: 29750, to: 30249.99, msc: 20000, ee: 1500, er: 3000, total: 4530 },
    { from: 30250, to: 30749.99, msc: 20000, ee: 1525, er: 3050, total: 4605 },
    { from: 30750, to: 31249.99, msc: 20000, ee: 1550, er: 3100, total: 4680 },
    { from: 31250, to: 31749.99, msc: 20000, ee: 1575, er: 3150, total: 4755 },
    { from: 31750, to: 32249.99, msc: 20000, ee: 1600, er: 3200, total: 4830 },
    { from: 32250, to: 32749.99, msc: 20000, ee: 1625, er: 3250, total: 4905 },
    { from: 32750, to: 33249.99, msc: 20000, ee: 1650, er: 3300, total: 4980 },
    { from: 33250, to: 33749.99, msc: 20000, ee: 1675, er: 3350, total: 5055 },
    { from: 33750, to: 34249.99, msc: 20000, ee: 1700, er: 3400, total: 5130 },
    { from: 34250, to: 34749.99, msc: 20000, ee: 1725, er: 3450, total: 5205 },
    { from: 34750, to: Infinity,  msc: 20000, ee: 1750, er: 3500, total: 5280 },
];

// ── Shared table header cell ───────────────────────────────────────────────────

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
    return (
        <th className={`px-5 py-3 text-white/50 font-semibold text-[0.68rem] uppercase tracking-wider whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
            {children}
        </th>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function TaxTablesPage() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : false;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <div className={`min-h-screen bg-background-alt flex flex-col${isDark ? '' : ' light'}`}>
            <Helmet>
                <title>2025 Philippine Tax Tables | BIR, SSS, PhilHealth, Pag-IBIG Contribution Schedules</title>
                <meta name="description" content="Complete 2025 Philippine tax and contribution reference tables. BIR withholding tax brackets (TRAIN Law), SSS contribution schedule, PhilHealth premium rates, and Pag-IBIG (HDMF) rates." />
                <link rel="canonical" href="https://taxphincomecalculator.netlify.app/tax-tables" />
                <meta property="og:title" content="2025 Philippine Tax & Contribution Tables" />
                <meta property="og:description" content="BIR withholding tax brackets, SSS contribution schedule, PhilHealth premium rates, and Pag-IBIG contribution rates for 2025." />
                <meta property="og:url" content="https://taxphincomecalculator.netlify.app/tax-tables" />
            </Helmet>

            <Header isDark={isDark} onThemeToggle={() => setIsDark(d => !d)} />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 space-y-8 pb-16">

                <div className="pt-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                        2025 Philippine{' '}
                        <span className="text-dash-green">Tax & Contribution Tables</span>
                    </h1>
                    <p className="text-white/45 text-sm mt-2 max-w-2xl leading-relaxed">
                        Reference tables for BIR income tax brackets (TRAIN Law), SSS contribution schedule,
                        PhilHealth premium rates, and Pag-IBIG (HDMF) contribution rates as of 2025.
                    </p>
                </div>

                {/* ── BIR Withholding Tax ── */}
                <section className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/6">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3.5 h-3.5 text-dash-green" />
                            <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
                                BIR Income Tax
                            </span>
                        </div>
                        <h2 className="text-white font-bold text-base">Withholding Tax Brackets (TRAIN Law)</h2>
                        <p className="text-white/40 text-xs mt-1">
                            Annual taxable income brackets effective 2023 onwards. Tax is computed annually
                            then divided by 12 for monthly withholding.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/6">
                                    <Th>Annual Taxable Income</Th>
                                    <Th right>Base Tax</Th>
                                    <Th right>Rate on Excess</Th>
                                    <Th right>Excess Over</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {BIR_BRACKETS.map((row, i) => (
                                    <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-3 text-white/80 font-medium">{row.range}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/65">
                                            {row.baseTax === 0 ? '—' : `₱ ${fmt(row.baseTax)}`}
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono text-dash-green font-bold">{row.rate}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/65">
                                            {row.excessOver === null ? '—' : `₱ ${fmt(row.excessOver)}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── PhilHealth ── */}
                <section className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/6">
                        <div className="flex items-center gap-2 mb-1">
                            <Heart className="w-3.5 h-3.5 text-dash-green" />
                            <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
                                PhilHealth
                            </span>
                        </div>
                        <h2 className="text-white font-bold text-base">Premium Contribution Schedule (2025)</h2>
                        <p className="text-white/40 text-xs mt-1">
                            Monthly premium rate is 5% of basic salary, split equally between employee and employer.
                            Minimum monthly contribution is ₱500 (at ₱10,000 salary); maximum is ₱5,000 (at ₱100,000+).
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/6">
                                    <Th>Monthly Basic Salary</Th>
                                    <Th right>Premium Rate</Th>
                                    <Th right>Employee Share</Th>
                                    <Th right>Employer Share</Th>
                                    <Th right>Monthly Total</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {PHILHEALTH_ROWS.map((row, i) => (
                                    <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-3 text-white/80 font-medium">{row.range}</td>
                                        <td className="px-5 py-3 text-right font-mono text-dash-green font-bold">{row.rate}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/70">{row.ee}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/70">{row.er}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/85 font-semibold">{row.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Pag-IBIG ── */}
                <section className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/6">
                        <div className="flex items-center gap-2 mb-1">
                            <Home className="w-3.5 h-3.5 text-dash-green" />
                            <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
                                Pag-IBIG / HDMF
                            </span>
                        </div>
                        <h2 className="text-white font-bold text-base">Contribution Schedule (2025)</h2>
                        <p className="text-white/40 text-xs mt-1">
                            Contributions are based on actual monthly compensation up to a maximum of ₱10,000.
                            Employee contribution is capped at ₱200/month; employer contribution is capped at ₱200/month.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/6">
                                    <Th>Monthly Compensation</Th>
                                    <Th right>Employee Rate</Th>
                                    <Th right>Employer Rate</Th>
                                    <Th right>Max Employee Contribution</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {PAGIBIG_ROWS.map((row, i) => (
                                    <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-3 text-white/80 font-medium">{row.range}</td>
                                        <td className="px-5 py-3 text-right font-mono text-dash-green font-bold">{row.ee}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/70">{row.er}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/85 font-semibold">{row.maxEe}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── SSS ── */}
                <section className="bg-card border border-white/5 rounded-2xl">
                    <div className="px-6 py-5 border-b border-white/6">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-3.5 h-3.5 text-dash-green" />
                            <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
                                SSS
                            </span>
                        </div>
                        <h2 className="text-white font-bold text-base">Contribution Table (2024–2025)</h2>
                        <p className="text-white/40 text-xs mt-1">
                            Based on SSS Circular No. 2024-006. Total remittance includes the Employees'
                            Compensation (EC) fund. For salaries above ₱20,250, the Mandatory Provident Fund
                            (MPF) is included in the EE and ER shares shown.
                        </p>
                    </div>
                    <div className="overflow-x-auto overflow-y-auto max-h-130">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card z-10">
                                <tr className="border-b border-white/6">
                                    <Th>Gross Compensation Range</Th>
                                    <Th right>MSC</Th>
                                    <Th right>Employee Share</Th>
                                    <Th right>Employer Share</Th>
                                    <Th right>Total Remittance</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {SSS_ROWS.map((row, i) => (
                                    <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-3 font-mono text-white/75 text-xs">
                                            {row.to === Infinity
                                                ? `₱${fmtRange(row.from)} and above`
                                                : `₱${fmtRange(row.from)} – ₱${fmtRange(row.to)}`}
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono text-white/55 text-xs">₱ {fmt(row.msc)}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/85 font-semibold text-xs">₱ {fmt(row.ee)}</td>
                                        <td className="px-5 py-3 text-right font-mono text-white/70 text-xs">₱ {fmt(row.er)}</td>
                                        <td className="px-5 py-3 text-right font-mono text-dash-green font-bold text-xs">₱ {fmt(row.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

            </main>
        </div>
    );
}
