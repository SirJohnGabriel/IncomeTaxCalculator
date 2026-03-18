import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { Layout } from "@/shared/components/Layout";
import { TaxCalculator } from "@features/taxCalculator/TaxCalculator";
import { TaxDashboard } from "@features/taxCalculator/TaxDashboard";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function AppRoutes() {
    return(
        <Routes>
            <Route index element={<TaxDashboard />} />
            <Route path="/old" element={<Layout><TaxCalculator /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export function AppRouter() {
    return(
        <ErrorBoundary>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ErrorBoundary>
    );
}