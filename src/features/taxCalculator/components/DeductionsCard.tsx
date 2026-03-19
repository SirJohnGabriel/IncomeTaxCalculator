import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { UserCheck } from "lucide-react";
import type { Salary } from "../types/Salary.types";
import { DetailRow } from "./DetailRow";

interface DeductionsCardProps {
  result: Salary | null;
  isSelfEmployed: boolean;
  /** True when the user selected the 8% flat rate but it was overridden to graduated due to the ₱3M threshold. */
  effectiveSchemeSwitched: boolean;
}

/**
 * Breakdown card for employee deductions (employed) or self-paid contributions (self-employed).
 * For self-employed, contribution labels reflect the full EE + ER amounts they cover personally.
 */
export function DeductionsCard({
  result: r,
  isSelfEmployed,
  effectiveSchemeSwitched,
}: DeductionsCardProps) {
  return (
    <Card className="flex-1 min-w-55 bg-card border-white/5">
      <CardHeader className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-dash-green" />
          <CardTitle className="text-[0.68rem] font-semibold uppercase tracking-widest text-dash-green">
            {isSelfEmployed ? "Your Contributions" : "Employee Deductions"}
          </CardTitle>
        </div>
        {isSelfEmployed && r && effectiveSchemeSwitched && (
          <p className="text-[0.65rem] text-amber-400 mt-1">
            Computed using graduated rates (income exceeded ₱3M/yr threshold)
          </p>
        )}
        {isSelfEmployed &&
          r &&
          !effectiveSchemeSwitched &&
          r.TaxScheme === "flat8" && (
            <p className="text-[0.65rem] text-white/30 mt-1">
              8% flat rate applied
            </p>
          )}
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-3">
        <DetailRow
          label={isSelfEmployed ? "PhilHealth (Full 5%)" : "PhilHealth"}
          value={r?.PhilhealthEmployeeContribution ?? 0}
        />
        <Separator className="bg-white/6" />
        <DetailRow
          label={isSelfEmployed ? "SSS (Full — EE + ER)" : "SSS"}
          value={r?.SssEmployeeContribution ?? 0}
        />
        <Separator className="bg-white/6" />
        <DetailRow
          label={isSelfEmployed ? "Pag-IBIG (Full — EE + ER)" : "Pag-IBIG"}
          value={r?.PagibigContribution ?? 0}
        />
        <Separator className="bg-white/6" />
        <DetailRow
          label={
            isSelfEmployed
              ? r?.TaxScheme === "flat8"
                ? "Income Tax (8% Flat)"
                : "Income Tax (Graduated)"
              : "Withholding Tax (BIR)"
          }
          value={r?.BirContribution ?? 0}
        />
        <Separator className="bg-white/15 my-1" />
        <DetailRow
          label="Total Deductions"
          value={r?.TotalDeductions ?? 0}
          total
          copyable
        />
      </CardContent>
    </Card>
  );
}
