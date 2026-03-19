export type EmploymentType = "employed" | "self-employed";
export type TaxScheme = "graduated" | "flat8";

export interface Salary {
  EmploymentType: EmploymentType;
  TaxScheme: TaxScheme;

  AnnualSalary: number | null;
  AnnualNetSalary: number | null;
  AnnualGrossSalary: number | null;

  NetSalary: number | null;
  GrossSalary: number | null;
  UntaxableIncome: number | null;

  PhilhealthEmployeeContribution: number | null;
  PhilhealthEmployerContribution: number | null;

  SssEmployeeContribution: number | null;
  SssEmployerContribution: number | null;

  PagibigContribution: number | null;
  BirContribution: number | null;

  TotalDeductions: number | null;
  EmployerContributions: number | null;
}
