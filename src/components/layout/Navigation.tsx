import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useAppTheme } from "@/hooks/useAppTheme";

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "saved", label: "Saved" },
  { key: "digest", label: "Digest" },
  { key: "settings", label: "Settings" },
  { key: "proof", label: "Proof" },
];

const Navigation = ({ currentPage, setCurrentPage }: NavigationProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggle } = useAppTheme();

  return (
    <nav className="navbar">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <button onClick={() => setCurrentPage("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="nav-logo-mark w-9 h-9 flex items-center justify-center font-semibold text-sm">JNT</div>
          <span className="font-semibold text-foreground hidden sm:inline">Job Notification Tracker</span>
        </button>

        <div className="hidden md:flex items-center gap-3">
          {navItems.map((p) => (
            <button
              key={p.key}
              onClick={() => setCurrentPage(p.key)}
              className={`nav-link text-sm px-3 py-1.5 ${currentPage === p.key ? "active" : ""}`}
            >
              {p.label}
            </button>
          ))}
          <button className="theme-toggle" aria-label="Toggle theme" onClick={toggle}>
            <span className="toggle-pill">
              <span className="toggle-circle">{isDark ? <Moon size={12} /> : <Sun size={12} />}</span>
            </span>
            <span className="toggle-label">{isDark ? "Dark" : "Light"}</span>
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button className="theme-toggle" aria-label="Toggle theme" onClick={toggle}>
            <span className="toggle-pill">
              <span className="toggle-circle">{isDark ? <Moon size={12} /> : <Sun size={12} />}</span>
            </span>
            <span className="toggle-label">{isDark ? "Dark" : "Light"}</span>
          </button>
          <button className="text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border px-6 py-3 flex flex-col gap-3 bg-background">
          {navItems.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setCurrentPage(p.key);
                setMenuOpen(false);
              }}
              className={`nav-link text-sm font-medium text-left px-3 py-1.5 ${currentPage === p.key ? "active" : ""}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;