import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import {
  Calculator,
  UserCheck,
  Briefcase,
  AlertTriangle,
  X,
} from "lucide-react";
import type { EmploymentType, TaxScheme } from "../types/Salary.types";
import { fmt, formatNumeric, parseRaw } from "../utils";

// ── Field Calculator Modal ─────────────────────────────────────────────────────

type Operator = "+" | "-" | "*" | "/";

const OP_SYMBOLS: Record<Operator, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

interface FieldCalculatorModalProps {
  label: string;
  rawValue: string;
  onRawChange: (raw: string) => void;
  onClose: () => void;
}

function FieldCalculatorModal({
  label,
  rawValue,
  onRawChange,
  onClose,
}: FieldCalculatorModalProps) {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [operandRaw, setOperandRaw] = useState("");

  const baseValue = parseFloat(rawValue || "0") || 0;
  const numbersDisabled = operator === null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (numbersDisabled) return;
      if (/^\d$/.test(e.key)) handleDigit(e.key);
      if (e.key === ".") handleDigit(".");
      if (e.key === "Backspace") handleBackspace();
      if (e.key === "Enter" || e.key === "=") handleEquals();
      if (e.key === "+") setOperator("+");
      if (e.key === "-") setOperator("-");
      if (e.key === "*") setOperator("*");
      if (e.key === "/") { e.preventDefault(); setOperator("/"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleOperator = (op: Operator) => {
    setOperator(op);
  };

  const handleDigit = (d: string) => {
    if (operator === null) return;
    if (d === "." && operandRaw.includes(".")) return;
    setOperandRaw((prev) => {
      if (prev === "" && d === ".") return "0.";
      return prev + d;
    });
  };

  const handleBackspace = () => {
    setOperandRaw((prev) => prev.slice(0, -1));
  };

  const computeResult = () => {
    if (!operator || !operandRaw) return null;
    const right = parseFloat(operandRaw);
    if (isNaN(right)) return null;
    switch (operator) {
      case "+": return baseValue + right;
      case "-": return baseValue - right;
      case "*": return baseValue * right;
      case "/": return right !== 0 ? baseValue / right : null;
    }
  };

  const handleEquals = () => {
    const result = computeResult();
    if (result === null) return;
    const rounded = Math.round(result * 100) / 100;
    onRawChange(String(rounded < 0 ? 0 : rounded));
    onClose();
  };

  const result = computeResult();
  const displayLeft = formatNumeric(rawValue || "0");
  const displayRight = operandRaw ? formatNumeric(operandRaw) : "";
  const opDisplay = operator ? OP_SYMBOLS[operator] : "";
  const previewFormatted =
    result !== null ? formatNumeric(String(Math.round(result * 100) / 100)) : null;

  const btnBase =
    "flex items-center justify-center rounded-xl font-mono text-base font-semibold h-12 w-full transition-all duration-100 select-none";
  const numBtnClass = cn(
    btnBase,
    numbersDisabled
      ? "bg-white/5 text-white/20 cursor-not-allowed"
      : "bg-white/8 text-white hover:bg-white/14 active:bg-white/22 cursor-pointer",
  );
  const opBtnClass = (active: boolean) =>
    cn(
      btnBase,
      "cursor-pointer",
      active
        ? "bg-dash-green text-card shadow-sm"
        : "bg-dash-green/15 text-dash-green hover:bg-dash-green/25",
    );
  const canConfirm = operator !== null && operandRaw !== "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-white/10 rounded-2xl shadow-2xl p-5 w-72 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-white/45">
            {label}
          </span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display */}
        <div className="bg-black/30 rounded-xl px-4 py-3 min-h-[4.5rem] flex flex-col items-end justify-end gap-0.5">
          <div className="text-white/40 text-xs font-mono truncate w-full text-right">
            ₱{displayLeft}
            {opDisplay && (
              <span className="mx-1.5 text-dash-green">{opDisplay}</span>
            )}
            {displayRight}
          </div>
          <div className="text-white text-2xl font-mono font-bold">
            ₱{previewFormatted ?? displayLeft}
          </div>
        </div>

        {/* Operator row */}
        <div className="grid grid-cols-4 gap-2">
          {(["+" , "-", "*", "/"] as Operator[]).map((op) => (
            <button
              key={op}
              onClick={() => handleOperator(op)}
              className={opBtnClass(operator === op)}
            >
              {OP_SYMBOLS[op]}
            </button>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              disabled={numbersDisabled}
              className={numBtnClass}
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleDigit(".")}
            disabled={numbersDisabled}
            className={numBtnClass}
          >
            .
          </button>
          <button
            onClick={() => handleDigit("0")}
            disabled={numbersDisabled}
            className={numBtnClass}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={numbersDisabled || operandRaw === ""}
            className={cn(
              numBtnClass,
              !numbersDisabled && operandRaw !== ""
                ? "bg-white/8 text-white hover:bg-white/14 cursor-pointer"
                : "",
            )}
          >
            ⌫
          </button>
        </div>

        {/* Confirm */}
        <button
          onClick={handleEquals}
          disabled={!canConfirm}
          className={cn(
            btnBase,
            "w-full",
            canConfirm
              ? "bg-dash-green text-card hover:bg-dash-green-accent cursor-pointer"
              : "bg-white/8 text-white/25 cursor-not-allowed",
          )}
        >
          =
        </button>
      </div>
    </div>
  );
}

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
  const [calcOpen, setCalcOpen] = useState(false);
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
    <>
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
                               px-0 h-auto py-3 text-base font-mono"
          />
          <button
            type="button"
            onClick={() => setCalcOpen(true)}
            tabIndex={-1}
            title="Open field calculator"
            className="px-2.5 text-white/30 hover:text-dash-green transition-colors shrink-0 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>
      </div>

      {calcOpen && (
        <FieldCalculatorModal
          label={label}
          rawValue={rawValue}
          onRawChange={onRawChange}
          onClose={() => setCalcOpen(false)}
        />
      )}
    </>
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
