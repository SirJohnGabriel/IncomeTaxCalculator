import { type ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen w-full bg-background flex">
            <div className="flex-1 flex flex-col h-full">
                <Header />
                <main className="flex-1 min-h-0 overflow-auto">
                    <div className="pt-6 h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
