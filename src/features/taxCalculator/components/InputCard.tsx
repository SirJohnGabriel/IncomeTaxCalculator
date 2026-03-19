import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { Calculator, UserCheck, Briefcase, AlertTriangle } from "lucide-react";
import type { EmploymentType, TaxScheme } from "../types/Salary.types";
import { fmt, formatNumeric, parseRaw } from "../utils";

// ── Sub-components used only within this card ─────────────────────────────────

interface NumericFieldProps {
  label: string;
  sublabel?: string;
  rawValue: string;
  onRawChange: (raw: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Controlled numeric input that displays formatted values (with commas) while
 * storing the raw unformatted string. Blocks non-numeric keypresses.
 */
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

interface SegmentedControlProps {
  value: string;
  options: { value: string; label: string; icon?: React.ReactNode }[];
  onChange: (val: string) => void;
}

/** Pill-style toggle for switching between two or more mutually exclusive options. */
function SegmentedControl({ value, options, onChange }: SegmentedControlProps) {
  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-150 cursor-pointer",
            value === opt.value
              ? "bg-dash-green text-card shadow-sm"
              : "text-white/50 hover:text-white/80",
          )}
        >
          {opt.icon && <span className="w-3.5 h-3.5">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface SchemeOptionProps {
  value: TaxScheme;
  selected: boolean;
  label: string;
  sublabel: string;
  onChange: (val: TaxScheme) => void;
}

/** Radio-style card used to select a tax scheme (graduated vs. 8% flat rate). */
function SchemeOption({
  value,
  selected,
  label,
  sublabel,
  onChange,
}: SchemeOptionProps) {
  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        "flex-1 flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border transition-all duration-150 text-left cursor-pointer",
        selected
          ? "border-dash-green/60 bg-dash-green/10 text-white"
          : "border-white/8 bg-white/3 text-white/50 hover:border-white/20 hover:text-white/70",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
            selected ? "border-dash-green" : "border-white/30",
          )}
        >
          {selected && (
            <span className="w-1.5 h-1.5 rounded-full bg-dash-green block" />
          )}
        </span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="text-[0.68rem] text-white/40 pl-5.5">{sublabel}</span>
    </button>
  );
}

// ── InputCard ─────────────────────────────────────────────────────────────────

interface InputCardProps {
  employmentType: EmploymentType;
  taxScheme: TaxScheme;
  incomeRaw: string;
  untaxableRaw: string;
  parsedIncome: number;
  flatRateExceeded: boolean;
  isUnchanged: boolean;
  onEmploymentTypeChange: (val: EmploymentType) => void;
  onTaxSchemeChange: (val: TaxScheme) => void;
  onIncomeChange: (raw: string) => void;
  onUntaxableChange: (raw: string) => void;
  onCalculate: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

/** Income input card — handles employment type, income fields, and tax scheme selection. */
export function InputCard({
  employmentType,
  taxScheme,
  incomeRaw,
  untaxableRaw,
  parsedIncome,
  flatRateExceeded,
  isUnchanged,
  onEmploymentTypeChange,
  onTaxSchemeChange,
  onIncomeChange,
  onUntaxableChange,
  onCalculate,
  onKeyDown,
}: InputCardProps) {
  const isSelfEmployed = employmentType === "self-employed";

  return (
    <Card className="flex-2 min-w-[320px] bg-card border-white/5">
      <CardHeader className="pb-4 px-7 pt-7">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-3.5 h-3.5 text-dash-green" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/45">
            Income Input
          </span>
        </div>
        <CardTitle className="text-white text-xl font-bold">
          Compute your take-home pay
        </CardTitle>
      </CardHeader>
      <CardContent className="px-7 pb-7 space-y-5">
        <SegmentedControl
          value={employmentType}
          onChange={(val) => onEmploymentTypeChange(val as EmploymentType)}
          options={[
            {
              value: "employed",
              label: "Employed",
              icon: <UserCheck className="w-3.5 h-3.5" />,
            },
            {
              value: "self-employed",
              label: "Self-Employed",
              icon: <Briefcase className="w-3.5 h-3.5" />,
            },
          ]}
        />

        <div className="flex gap-4 items-end flex-wrap">
          <NumericField
            label={
              isSelfEmployed ? "Monthly Gross Income" : "Monthly Basic Salary"
            }
            rawValue={incomeRaw}
            onRawChange={onIncomeChange}
            onKeyDown={onKeyDown}
          />
          {!isSelfEmployed && (
            <NumericField
              label="Non-taxable Allowances"
              sublabel="(optional)"
              rawValue={untaxableRaw}
              onRawChange={onUntaxableChange}
              onKeyDown={onKeyDown}
            />
          )}
        </div>

        {isSelfEmployed && (
          <div className="space-y-2">
            <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-white/50">
              Tax Rate Option
            </span>
            <div className="flex gap-3 flex-wrap">
              <SchemeOption
                value="graduated"
                selected={taxScheme === "graduated"}
                label="Graduated"
                sublabel="Progressive rates — 0% to 35%"
                onChange={onTaxSchemeChange}
              />
              <SchemeOption
                value="flat8"
                selected={taxScheme === "flat8"}
                label="8% Flat Rate"
                sublabel="8% of gross income above ₱250K/yr"
                onChange={onTaxSchemeChange}
              />
            </div>
            {flatRateExceeded && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 mt-1">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-300 text-xs leading-relaxed">
                  Monthly income of ₱{fmt(parsedIncome)} exceeds the
                  ₱250,000/month (₱3M/year) threshold for 8% flat rate.
                  Graduated rates will be applied instead.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onCalculate}
          disabled={!incomeRaw || isUnchanged}
          className={cn(
            "w-full font-bold text-sm py-3 rounded-xl border-none transition-all duration-150",
            incomeRaw && !isUnchanged
              ? "bg-dash-green text-card cursor-pointer hover:bg-dash-green-accent"
              : "bg-white/8 text-white/25 cursor-not-allowed",
          )}
        >
          Calculate
        </button>
      </CardContent>
    </Card>
  );
}
