import sssData from '../../../assets/sss.csv?raw';
import type { Salary } from "../types/Salary.types";

export function UseTaxCalculator() {
    const PhilHealthCalculator = (salary: number): [number, number] => {
        const contribution = salary * 0.05;

        if (contribution > 5000)
            return [2500, 2500];

        return [contribution / 2, contribution / 2];
    };

    const BirCalculator = (salary: number): number => {
        const annualSalary = salary * 12;
        let tax = 0;

        if (annualSalary <= 250000)
            tax = 0;
        else if (annualSalary <= 400000)
            tax = (annualSalary - 250000) * 0.15;
        else if (annualSalary <= 800000)
            tax = 22500 + (annualSalary - 400000) * 0.20;
        else if (annualSalary <= 2000000)
            tax = 102500 + (annualSalary - 800000) * 0.25;
        else if (annualSalary <= 8000000)
            tax = 402500 + (annualSalary - 2000000) * 0.30;
        else
            tax = 2202500 + (annualSalary - 8000000) * 0.35;

        return tax / 12;
    };

    const PagibigCalculator = (salary: number): number => {
        let contribution = salary * 0.01;

        if (contribution > 200)
            contribution = 200;

        return contribution;
    };

    const SssCalculator = (salary: number): [number, number] => {
        const lines = sssData.trim().split('\n');
        const headers = lines[0].split(',');
        const grossFromIdx = headers.indexOf('Gross_From');
        const grossToIdx = headers.indexOf('Gross_To');
        const eeIdx = headers.indexOf('SSS_EE_Share');
        const erIdx = headers.indexOf('SSS_ER_Share');

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            const grossFrom = parseFloat(cols[grossFromIdx]);
            const grossTo = cols[grossToIdx].trim() === 'infinity' ? Infinity : parseFloat(cols[grossToIdx]);

            if (salary >= grossFrom && salary < grossTo)
                return [parseFloat(cols[eeIdx]), parseFloat(cols[erIdx])];
        }

        return [0, 0];
    };

    const IncomeTaxCalculator = (salary: number, untaxableIncome: number): Salary => {
        const [philhealthEE, philhealthER] = PhilHealthCalculator(salary);
        const [sssEE, sssER] = SssCalculator(salary);
        const pagibig = PagibigCalculator(salary);
        const bir = BirCalculator(salary);

        const totalDeductions = philhealthEE + sssEE + pagibig + bir;
        const employerContributions = philhealthER + sssER;
        const netSalary = salary - totalDeductions + untaxableIncome;

        return {
            AnnualSalary: salary * 12,
            AnnualNetSalary: netSalary * 12,
            AnnualGrossSalary: (salary + untaxableIncome) * 12,
            NetSalary: netSalary,
            GrossSalary: salary + untaxableIncome,
            UntaxableIncome: untaxableIncome,
            PhilhealthEmployeeContribution: philhealthEE,
            PhilhealthEmployerContribution: philhealthER,
            SssEmployeeContribution: sssEE,
            SssEmployerContribution: sssER,
            PagibigContribution: pagibig,
            BirContribution: bir,
            TotalDeductions: totalDeductions,
            EmployerContributions: employerContributions,
        };
    };

    return { IncomeTaxCalculator };
}