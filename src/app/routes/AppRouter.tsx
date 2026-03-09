import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { Layout } from "@/shared/components/Layout";
import { TaxCalculator } from "@features/taxCalculator/TaxCalculator";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function AppRoutes() {
    return(
        <Layout>
            <Routes>
                <Route index element={<TaxCalculator /> } />            
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
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