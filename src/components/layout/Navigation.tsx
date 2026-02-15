import { useState } from "react";

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

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => setCurrentPage("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-red-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">JNT</div>
          <span className="font-semibold text-foreground hidden sm:inline">Job Tracker</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(p => (
            <button key={p.key} onClick={() => setCurrentPage(p.key)}
              className={`text-sm font-medium transition-colors ${currentPage === p.key ? "text-red-700" : "text-muted-foreground hover:text-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Hamburger button (mobile only) */}
        <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border px-6 py-3 flex flex-col gap-3 bg-background">
          {navItems.map(p => (
            <button key={p.key} onClick={() => { setCurrentPage(p.key); setMenuOpen(false); }}
              className={`text-sm font-medium text-left transition-colors ${currentPage === p.key ? "text-red-700" : "text-muted-foreground hover:text-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
