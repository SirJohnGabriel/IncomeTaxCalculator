import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { CalendarDays } from "lucide-react";
import type { Salary } from "../types/Salary.types";
import { DetailRow } from "./DetailRow";

interface ProjectionsCardProps {
  result: Salary | null;
  isSelfEmployed: boolean;
}

/**
 * Annual projection card showing gross, basic (employed only), and net income
 * extrapolated from the monthly figures.
 */
export function ProjectionsCard({
  result: r,
  isSelfEmployed,
}: ProjectionsCardProps) {
  return (
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
          label={isSelfEmployed ? "Annual Gross Income" : "Annual Gross Salary"}
          value={r?.AnnualGrossSalary ?? 0}
        />
        {!isSelfEmployed && (
          <>
            <Separator className="bg-white/6" />
            <DetailRow
              label="Annual Basic Salary"
              value={r?.AnnualSalary ?? 0}
            />
          </>
        )}
        <Separator className="bg-white/6" />
        <DetailRow
          label="Annual Deductions"
          value={(r?.TotalDeductions ?? 0) * 12}
        />
        <Separator className="bg-white/15 my-1" />
        <DetailRow
          label={isSelfEmployed ? "Annual Net Income" : "Annual Net Salary"}
          value={r?.AnnualNetSalary ?? 0}
          total
          copyable
        />
      </CardContent>
    </Card>
  );
}
