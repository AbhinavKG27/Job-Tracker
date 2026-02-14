import { useState, useCallback, useEffect } from "react";

export interface TestItem {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
}

const DEFAULT_ITEMS: Omit<TestItem, "checked">[] = [
  { id: "prefs-persist", label: "Preferences persist after refresh", hint: "Set preferences, refresh the page, and verify they remain." },
  { id: "match-score", label: "Match score calculates correctly", hint: "Check a job with known criteria and verify the score." },
  { id: "show-matches", label: '"Show only matches" toggle works', hint: "Toggle the filter and confirm only matching jobs appear." },
  { id: "save-job", label: "Save job persists after refresh", hint: "Save a job, refresh, and confirm it's still saved." },
  { id: "apply-tab", label: "Apply opens in new tab", hint: 'Click "Apply" and verify a new browser tab opens.' },
  { id: "status-persist", label: "Status update persists after refresh", hint: "Change a job status, refresh, and verify it sticks." },
  { id: "status-filter", label: "Status filter works correctly", hint: "Filter by a status and confirm only those jobs show." },
  { id: "digest-top10", label: "Digest generates top 10 by score", hint: "Open digest and verify 10 jobs sorted by score." },
  { id: "digest-persist", label: "Digest persists for the day", hint: "Generate digest, navigate away and back — should stay." },
  { id: "no-console-errors", label: "No console errors on main pages", hint: "Open DevTools console and navigate all pages." },
];

const STORAGE_KEY = "jt-test-checklist";

export function useTestChecklist() {
  const [items, setItems] = useState<TestItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: TestItem[] = JSON.parse(stored);
        // Merge with defaults in case new items were added
        return DEFAULT_ITEMS.map((d) => {
          const found = parsed.find((p) => p.id === d.id);
          return { ...d, checked: found?.checked ?? false };
        });
      }
    } catch {}
    return DEFAULT_ITEMS.map((d) => ({ ...d, checked: false }));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const reset = useCallback(() => {
    setItems(DEFAULT_ITEMS.map((d) => ({ ...d, checked: false })));
  }, []);

  const passedCount = items.filter((i) => i.checked).length;
  const allPassed = passedCount === items.length;

  return { items, toggle, reset, passedCount, total: items.length, allPassed };
}
