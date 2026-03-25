import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/shared/components/Header";
import { FileText, Heart, Home, Shield } from "lucide-react";
import sssData from "@assets/sss.csv?raw";

// ── Formatters ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtRange = (n: number) =>
  n % 1 === 0
    ? n.toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : n.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

// ── Reference Data ─────────────────────────────────────────────────────────────

const BIR_BRACKETS = [
  { range: "₱0 – ₱250,000", baseTax: 0, rate: "0%", excessOver: null },
  { range: "₱250,001 – ₱400,000", baseTax: 0, rate: "15%", excessOver: 250000 },
  {
    range: "₱400,001 – ₱800,000",
    baseTax: 22500,
    rate: "20%",
    excessOver: 400000,
  },
  {
    range: "₱800,001 – ₱2,000,000",
    baseTax: 102500,
    rate: "25%",
    excessOver: 800000,
  },
  {
    range: "₱2,000,001 – ₱8,000,000",
    baseTax: 402500,
    rate: "30%",
    excessOver: 2000000,
  },
  {
    range: "Over ₱8,000,000",
    baseTax: 2202500,
    rate: "35%",
    excessOver: 8000000,
  },
];

const PHILHEALTH_ROWS = [
  {
    range: "Below ₱10,000",
    rate: "5%",
    ee: "₱250.00",
    er: "₱250.00",
    total: "₱500.00",
  },
  {
    range: "₱10,000 – ₱99,999.99",
    rate: "5%",
    ee: "2.5% of salary",
    er: "2.5% of salary",
    total: "5% of salary",
  },
  {
    range: "₱100,000 and above",
    rate: "5%",
    ee: "₱2,500.00",
    er: "₱2,500.00",
    total: "₱5,000.00",
  },
];

const PAGIBIG_ROWS = [
  { range: "₱1,500 and below", ee: "1%", er: "2%", maxEe: "₱15.00" },
  { range: "Over ₱1,500", ee: "2%", er: "2%", maxEe: "₱200.00" },
];

const SSS_ROWS = (() => {
  const lines = sssData.trim().split("\n");
  const headers = lines[0].split(",");
  const idx = (col: string) => headers.indexOf(col);
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const grossTo = cols[idx("Gross_To")].trim();
    return {
      from: parseFloat(cols[idx("Gross_From")]),
      to: grossTo === "infinity" ? Infinity : parseFloat(grossTo),
      msc: parseFloat(cols[idx("Reg_Total")]),
      ee: parseFloat(cols[idx("SSS_EE_Share")]),
      er: parseFloat(cols[idx("SSS_ER_Share")]),
      total: parseFloat(cols[idx("Total_Remittance")]),
    };
  });
})();

// ── Shared table header cell ───────────────────────────────────────────────────

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-5 py-3 text-white/50 font-semibold text-[0.68rem] uppercase tracking-wider whitespace-nowrap ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function TaxTablesPage() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div
      className={`min-h-screen bg-background-alt flex flex-col${isDark ? "" : " light"}`}
    >
      <Helmet>
        <title>
          2025 Philippine Tax Tables | BIR, SSS, PhilHealth, Pag-IBIG
          Contribution Schedules
        </title>
        <meta
          name="description"
          content="Complete 2025 Philippine tax and contribution reference tables. BIR withholding tax brackets (TRAIN Law), SSS contribution schedule, PhilHealth premium rates, and Pag-IBIG (HDMF) rates."
        />
        <link
          rel="canonical"
          href="https://taxphincomecalculator.netlify.app/tax-tables"
        />
        <meta
          property="og:title"
          content="2025 Philippine Tax & Contribution Tables"
        />
        <meta
          property="og:description"
          content="BIR withholding tax brackets, SSS contribution schedule, PhilHealth premium rates, and Pag-IBIG contribution rates for 2025."
        />
        <meta
          property="og:url"
          content="https://taxphincomecalculator.netlify.app/tax-tables"
        />
      </Helmet>

      <Header isDark={isDark} onThemeToggle={() => setIsDark((d) => !d)} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 space-y-8 pb-16">
        <div className="pt-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            2025 Philippine{" "}
            <span className="text-dash-green">Tax & Contribution Tables</span>
          </h1>
          <p className="text-white/45 text-sm mt-2 max-w-2xl leading-relaxed">
            Reference tables for BIR income tax brackets (TRAIN Law), SSS
            contribution schedule, PhilHealth premium rates, and Pag-IBIG (HDMF)
            contribution rates as of 2025.
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
            <h2 className="text-white font-bold text-base">
              Withholding Tax Brackets (TRAIN Law)
            </h2>
            <p className="text-white/40 text-xs mt-1">
              Annual taxable income brackets effective 2023 onwards. Tax is
              computed annually then divided by 12 for monthly withholding.
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
                  <tr
                    key={i}
                    className="border-b border-white/4 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3 text-white/80 font-medium">
                      {row.range}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/65">
                      {row.baseTax === 0 ? "—" : `₱ ${fmt(row.baseTax)}`}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-dash-green font-bold">
                      {row.rate}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/65">
                      {row.excessOver === null
                        ? "—"
                        : `₱ ${fmt(row.excessOver)}`}
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
            <h2 className="text-white font-bold text-base">
              Premium Contribution Schedule (2025)
            </h2>
            <p className="text-white/40 text-xs mt-1">
              Monthly premium rate is 5% of basic salary, split equally between
              employee and employer. Minimum monthly contribution is ₱500 (at
              ₱10,000 salary); maximum is ₱5,000 (at ₱100,000+).
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
                  <tr
                    key={i}
                    className="border-b border-white/4 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3 text-white/80 font-medium">
                      {row.range}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-dash-green font-bold">
                      {row.rate}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/70">
                      {row.ee}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/70">
                      {row.er}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/85 font-semibold">
                      {row.total}
                    </td>
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
            <h2 className="text-white font-bold text-base">
              Contribution Schedule (2025)
            </h2>
            <p className="text-white/40 text-xs mt-1">
              Contributions are based on actual monthly compensation up to a
              maximum of ₱10,000. Employee contribution is capped at ₱200/month;
              employer contribution is capped at ₱200/month.
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
                  <tr
                    key={i}
                    className="border-b border-white/4 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3 text-white/80 font-medium">
                      {row.range}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-dash-green font-bold">
                      {row.ee}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/70">
                      {row.er}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/85 font-semibold">
                      {row.maxEe}
                    </td>
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
            <h2 className="text-white font-bold text-base">
              Contribution Table (2024–2025)
            </h2>
            <p className="text-white/40 text-xs mt-1">
              Based on SSS Circular No. 2024-006. Total remittance includes the
              Employees' Compensation (EC) fund. For salaries above ₱20,250, the
              Mandatory Provident Fund (MPF) is included in the EE and ER shares
              shown.
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
                  <tr
                    key={i}
                    className="border-b border-white/4 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-white/75 text-xs">
                      {row.to === Infinity
                        ? `₱${fmtRange(row.from)} and above`
                        : `₱${fmtRange(row.from)} – ₱${fmtRange(row.to)}`}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/55 text-xs">
                      ₱ {fmt(row.msc)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/85 font-semibold text-xs">
                      ₱ {fmt(row.ee)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-white/70 text-xs">
                      ₱ {fmt(row.er)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-dash-green font-bold text-xs">
                      ₱ {fmt(row.total)}
                    </td>
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
