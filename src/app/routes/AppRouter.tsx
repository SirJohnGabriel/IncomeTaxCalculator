import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { TaxDashboard } from "@features/taxCalculator/TaxDashboard";
import { TaxTablesPage } from "@features/taxTables/TaxTablesPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<TaxDashboard />} />
      <Route path="/tax-tables" element={<TaxTablesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
