import { useState, useEffect } from "react";
import type { Salary } from "./types/Salary.types";
import { UseTaxCalculator } from "./hooks/UseTaxCalculator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import logo from "@assets/logo.png";
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  CalendarDays,
  Building2,
  UserCheck,
  Calculator,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(value: number) {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Insert thousand-separators while preserving a trailing decimal point / digits */
function formatNumeric(raw: string): string {
  if (!raw) return "";
  const dotIdx = raw.indexOf(".");
  const intPart = dotIdx >= 0 ? raw.slice(0, dotIdx) : raw;
  const decPart = dotIdx >= 0 ? raw.slice(dotIdx) : "";
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedInt + decPart;
}

/** Strip commas and validate only digits + one dot */
function parseRaw(displayed: string): string {
  const stripped = displayed.replace(/,/g, "");
  return /^\d*\.?\d*$/.test(stripped) ? stripped : null!;
}

const PIE_SLICES = [
  { name: "Basic Salary After Taxes", color: "#7EC341" },
  { name: "Deductions", color: "#B7EE7C" },
  { name: "Allowances", color: "#D8F8B4" },
];

// ── Metric card ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
}

function MetricCard({ label, value, sub, icon, accent }: MetricCardProps) {
  return (
    <Card
      className={cn(
        "flex-1 min-w-0 bg-card-alt border-white/5",
        accent && "border-t-2 border-t-dash-green",
      )}
    >
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/50">
            {label}
          </span>
          <span
            className={cn(
              "opacity-60",
              accent ? "text-dash-green" : "text-white/40",
            )}
          >
            {icon}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <p
          className={cn(
            "text-2xl font-bold font-mono leading-tight",
            accent ? "text-dash-green-bright" : "text-white",
          )}
        >
          ₱ {fmt(value)}
        </p>
        <p className="text-[0.72rem] text-white/40 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────
function DetailRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total?: boolean;
}) {
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
      <span
        className={cn(
          "font-mono text-sm",
          total ? "text-dash-green-bright font-bold" : "text-white/75",
        )}
      >
        ₱ {fmt(value)}
      </span>
    </div>
  );
}

// ── Numeric input field ───────────────────────────────────────────────────────
interface NumericFieldProps {
  label: string;
  sublabel?: string;
  rawValue: string;
  onRawChange: (raw: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

function NumericField({
  label,
  sublabel,
  rawValue,
  onRawChange,
  onKeyDown,
}: NumericFieldProps) {
  const displayed = formatNumeric(rawValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseRaw(e.target.value);
    if (raw !== null) onRawChange(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block non-numeric keys (allow: digits, dot, backspace, delete, arrows, tab, ctrl/cmd combos)
    const allowed =
      /[\d.]|Backspace|Delete|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Tab|Home|End/;
    if (!allowed.test(e.key) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
    onKeyDown(e);
  };

  return (
    <div className="flex-1 min-w-50">
      <label className="block mb-2">
        <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-white/50">
          {label}
        </span>
        {sublabel && (
          <span className="text-[0.72rem] text-white/25 ml-1.5 normal-case font-normal">
            {sublabel}
          </span>
        )}
      </label>
      <div
        className={cn(
          "flex items-center rounded-xl border border-white/8 bg-white/5 overflow-hidden",
          "focus-within:border-dash-green/50 focus-within:ring-1 focus-within:ring-dash-green/30 transition-all",
        )}
      >
        <span className="px-3 text-dash-green font-bold text-base select-none shrink-0">
          ₱
        </span>
        <Input
          inputMode="decimal"
          placeholder="0.00"
          value={displayed}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-0
                               px-0 pr-3 h-auto py-3 text-base font-mono"
        />
      </div>
    </div>
  );
}

// ── Pie chart custom tooltip ──────────────────────────────────────────────────
function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { percent: number };
  }>;
}) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-white/60 mb-0.5">{name}</p>
      <p className="text-white font-mono font-bold">₱ {fmt(value)}</p>
      <p className="text-dash-green-bright">{(p.percent * 100).toFixed(1)}%</p>
    </div>
  );
}

// ── Google AdSense unit ───────────────────────────────────────────────────────
// Replace data-ad-client and data-ad-slot with your actual AdSense values.
// Make sure the AdSense <script> tag is present in index.html.
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

// ── Ad sidebar (desktop only) ─────────────────────────────────────────────────
function AdColumn() {
  return (
    <aside className="hidden md:flex w-40 shrink-0 flex-col gap-4 pt-5">
      <AdUnit slot="1234567890" />
      <AdUnit slot="0987654321" />
    </aside>
  );
}

// ── Ad banner (mobile only) ───────────────────────────────────────────────────
function AdBanner({ slot }: { slot: string }) {
  return (
    <div className="md:hidden w-full">
      <AdUnit slot={slot} />
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export function TaxDashboard() {
  const { IncomeTaxCalculator } = UseTaxCalculator();

  const [salaryRaw, setSalaryRaw] = useState("");
  const [untaxableRaw, setUntaxableRaw] = useState("");
  const [result, setResult] = useState<Salary | null>(null);

  const handleCalculate = () => {
    const salary = parseFloat(salaryRaw);
    const untaxable = parseFloat(untaxableRaw) || 0;
    if (!salaryRaw || isNaN(salary) || salary < 0) return;
    setResult(IncomeTaxCalculator(salary, untaxable));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const r = result;

  // Pie chart data — breakdown of Gross Salary (order follows PIE_SLICES)
  const pieData = [
    {
      ...PIE_SLICES[0],
      value: (r?.NetSalary ?? 0) - (r?.UntaxableIncome ?? 0),
    },
    { ...PIE_SLICES[1], value: r?.TotalDeductions ?? 0 },
    { ...PIE_SLICES[2], value: r?.UntaxableIncome ?? 0 },
  ].filter((d) => d.value > 0);

  const hasData = pieData.length > 0;

  return (
    <div className="min-h-screen bg-background-alt">
      {/* ── Page header (full width) ── */}
      <header className="flex items-center justify-between px-4 md:px-8 py-5">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Logo" className="h-8" />
          <span className="text-[1.05rem] font-bold text-white tracking-tight">
            PH Salary <span className="text-dash-green">Tax Calculator</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="muted"
            className="bg-black/10 text-[#6b6966] border-0 font-medium hover:cursor-not-allowed"
          >
            TRAIN Law
          </Badge>
          <Badge
            variant="muted"
            className="bg-black/10 text-[#6b6966] border-0 font-medium hover:cursor-not-allowed"
          >
            2024 Tax Tables
          </Badge>
        </div>
      </header>

      {/* ── Mobile top ad ── */}
      <AdBanner slot="1111111111" />

      {/* ── Body: left ad | content | right ad ── */}
      <div className="flex gap-5 px-2 md:px-5">
        <AdColumn />

        <main className="flex-1 min-w-0 pb-12 space-y-5">
          {/* ── Row 1: Input card + Pie chart card ── */}
          <div className="flex gap-5 flex-wrap">
            {/* Input card */}
            <Card className="flex-2 min-w-[320px] bg-card border-white/5">
              <CardHeader className="pb-4 px-7 pt-7">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="w-3.5 h-3.5 text-dash-green" />
                  <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/45">
                    Salary Input
                  </span>
                </div>
                <CardTitle className="text-white text-xl font-bold">
                  Compute your take-home pay
                </CardTitle>
              </CardHeader>
              <CardContent className="px-7 pb-7">
                <div className="flex gap-4 items-end flex-wrap">
                  <NumericField
                    label="Monthly Basic Salary"
                    rawValue={salaryRaw}
                    onRawChange={setSalaryRaw}
                    onKeyDown={handleKeyDown}
                  />
                  <NumericField
                    label="Non-taxable Allowances"
                    sublabel="(optional)"
                    rawValue={untaxableRaw}
                    onRawChange={setUntaxableRaw}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  onClick={handleCalculate}
                  disabled={!salaryRaw}
                  className={cn(
                    "mt-5 w-full font-bold text-sm py-3 rounded-xl border-none transition-all duration-150",
                    salaryRaw
                      ? "bg-dash-green text-card cursor-pointer hover:bg-dash-green-accent"
                      : "bg-white/8 text-white/25 cursor-not-allowed",
                  )}
                >
                  Calculate
                </button>
              </CardContent>
            </Card>

            {/* Pie chart card */}
            <Card className="flex-[1.2] min-w-70 bg-card border-white/5 flex flex-col">
              <CardHeader className="pb-2 px-6 pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <PieChartIcon className="w-3.5 h-3.5 text-dash-green" />
                  <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/45">
                    Gross Salary Breakdown
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
                          <Cell
                            key={i}
                            fill={entry.color}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        content={() => (
                          <ul
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "center",
                              gap: "8px 16px",
                              margin: 0,
                              padding: 0,
                              listStyle: "none",
                            }}
                          >
                            {PIE_SLICES.filter((s) =>
                              pieData.some((d) => d.name === s.name),
                            ).map((s) => (
                              <li
                                key={s.name}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    backgroundColor: s.color,
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: "0.72rem",
                                  }}
                                >
                                  {s.name}
                                </span>
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
                    <p className="text-white/25 text-sm">
                      Enter a salary and calculate to see the breakdown
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Row 2: Summary metric cards ── */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
            <MetricCard
              label="Net Salary"
              value={r?.NetSalary ?? 0}
              sub="Monthly take-home pay"
              icon={<Wallet className="w-4 h-4" />}
              accent
            />
            <MetricCard
              label="Gross Salary"
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
              label="Annual Net Salary"
              value={r?.AnnualNetSalary ?? 0}
              sub="Projected yearly take-home"
              icon={<CalendarDays className="w-4 h-4" />}
            />
          </div>

          {/* ── Row 3: Detail breakdown cards ── */}
          <div className="flex gap-4 flex-wrap">
            <Card className="flex-1 min-w-55 bg-card border-white/5">
              <CardHeader className="px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-dash-green" />
                  <CardTitle className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
                    Employee Deductions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-3">
                <DetailRow
                  label="PhilHealth"
                  value={r?.PhilhealthEmployeeContribution ?? 0}
                />
                <Separator className="bg-white/6" />
                <DetailRow
                  label="SSS"
                  value={r?.SssEmployeeContribution ?? 0}
                />
                <Separator className="bg-white/6" />
                <DetailRow
                  label="Pag-IBIG"
                  value={r?.PagibigContribution ?? 0}
                />
                <Separator className="bg-white/6" />
                <DetailRow
                  label="Withholding Tax (BIR)"
                  value={r?.BirContribution ?? 0}
                />
                <Separator className="bg-white/15 my-1" />
                <DetailRow
                  label="Total Deductions"
                  value={r?.TotalDeductions ?? 0}
                  total
                />
              </CardContent>
            </Card>

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
                <DetailRow
                  label="PhilHealth"
                  value={r?.PhilhealthEmployerContribution ?? 0}
                />
                <Separator className="bg-white/6" />
                <DetailRow
                  label="SSS"
                  value={r?.SssEmployerContribution ?? 0}
                />
                <Separator className="bg-white/15 my-1" />
                <DetailRow
                  label="Total Contributions"
                  value={r?.EmployerContributions ?? 0}
                  total
                />
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-55 bg-card border-white/5">
              <CardHeader className="px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-dash-green" />
                  <CardTitle className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
                    Annual Projections
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-3">
                <DetailRow
                  label="Annual Gross Salary"
                  value={r?.AnnualGrossSalary ?? 0}
                />
                <Separator className="bg-white/6" />
                <DetailRow
                  label="Annual Basic Salary"
                  value={r?.AnnualSalary ?? 0}
                />
                <Separator className="bg-white/15 my-1" />
                <DetailRow
                  label="Annual Net Salary"
                  value={r?.AnnualNetSalary ?? 0}
                  total
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <AdColumn />
      </div>

      {/* ── Mobile bottom ad ── */}
      <AdBanner slot="2222222222" />
    </div>
  );
}
