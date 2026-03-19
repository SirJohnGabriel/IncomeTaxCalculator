import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/shared/components/ui/navigation-menu";
import logo from "@assets/logo_phitc_2.png";

interface SiteHeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function Header({ isDark, onThemeToggle }: SiteHeaderProps) {
  const { pathname } = useLocation();
  const isTaxTables = pathname === "/tax-tables";
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navItemClass =
    "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 text-white/55 border border-white/10 hover:text-white hover:bg-white/10 cursor-pointer";

  const navLinkClass =
    "block w-full px-4 py-3 text-sm font-medium rounded-md transition-colors text-white/70 hover:text-white hover:bg-white/8";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background-alt/75 border-b border-white/2">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-5">
        <Link
          to="/"
          style={{ textDecoration: "none" }}
          className="flex items-center gap-2.5"
        >
          <img src={logo} alt="Logo" className="h-10" />
          <span className="text-[1.05rem] font-bold text-white tracking-tight">
            PH Income <span className="text-dash-green">Tax Calculator</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  {isTaxTables ? (
                    <NavigationMenuLink asChild>
                      <Link to="/" className={navItemClass}>
                        Income Tax Calculator
                      </Link>
                    </NavigationMenuLink>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        to="/tax-tables"
                        className={navItemClass}
                      >
                        2025 Tax Tables
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="https://lawphil.net/statutes/repacts/ra2017/ra_10963_2017.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={navItemClass}
                  >
                    TRAIN Law
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="https://github.com/SirJohnGabriel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={navItemClass}
                  >
                    About Me
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className="ml-1 p-2 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all duration-150 cursor-pointer"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Mobile burger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all duration-150 cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 z-50 px-4 pb-4 border-t bg-card border-white/8">
          <nav className="flex flex-col pt-2 gap-1">
            <a
              href="https://github.com/SirJohnGabriel"
              target="_blank"
              rel="noopener noreferrer"
              className={navLinkClass}
              onClick={closeMenu}
            >
              About Me
            </a>
            <a
              href="https://lawphil.net/statutes/repacts/ra2017/ra_10963_2017.html"
              target="_blank"
              rel="noopener noreferrer"
              className={navLinkClass}
              onClick={closeMenu}
            >
              TRAIN Law
            </a>
            {isTaxTables ? (
              <Link to="/" className={navLinkClass} onClick={closeMenu}>
                Income Tax Calculator
              </Link>
            ) : (
              <Link
                to="/tax-tables"
                className={navLinkClass}
                onClick={closeMenu}
              >
                2025 Tax Tables
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
