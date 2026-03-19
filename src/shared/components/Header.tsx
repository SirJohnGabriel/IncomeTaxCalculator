import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import logo from '@assets/logo_phitc_2.png';

interface SiteHeaderProps {
    isDark: boolean;
    onThemeToggle: () => void;
}

export function Header({ isDark, onThemeToggle }: SiteHeaderProps) {
    const { pathname } = useLocation();
    const isTaxTables = pathname === '/tax-tables';

    return (
        <header className="flex items-center justify-between px-4 md:px-8 py-5">
            <Link to="/" style={{ textDecoration: 'none' }} className="flex items-center gap-2.5">
                <img src={logo} alt="Logo" className="h-10" />
                <span className="text-[1.05rem] font-bold text-white tracking-tight">
                    PH Income{' '}
                    <span className="text-dash-green">Tax Calculator</span>
                </span>
            </Link>
            <div className="flex items-center gap-2">
                <Badge
                    variant="muted"
                    className="bg-black/10 text-[#6b6966] border-0 font-medium cursor-pointer"
                    onClick={() => window.open('https://lawphil.net/statutes/repacts/ra2017/ra_10963_2017.html', '_blank')}
                >
                    TRAIN Law
                </Badge>
                {isTaxTables ? (
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Badge variant="muted" className="bg-black/10 text-[#6b6966] border-0 font-medium cursor-pointer">
                            Income Tax Calculator
                        </Badge>
                    </Link>
                ) : (
                    <Link to="/tax-tables" style={{ textDecoration: 'none' }}>
                        <Badge variant="muted" className="bg-black/10 text-[#6b6966] border-0 font-medium cursor-pointer">
                            2025 Tax Tables
                        </Badge>
                    </Link>
                )}
                <button
                    onClick={onThemeToggle}
                    className="ml-1 p-2 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all duration-150 cursor-pointer"
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>
        </header>
    );
}
