import { ALL_LOCATIONS, ALL_MODES, ALL_EXPERIENCES, ALL_SOURCES } from "@/lib/jobsData";
import { ALL_STATUSES } from "@/lib/jobStatus";

export interface Filters {
  keyword: string;
  location: string;
  mode: string;
  experience: string;
  source: string;
  sort: string;
  status: string;
}

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterBar = ({ filters, setFilters }: FilterBarProps) => (
  <div className="bg-card border border-border rounded-xl p-5 mb-6">
    <div className="mb-4">
      <p className="text-sm font-medium text-foreground mb-2">Search & Filter</p>
      <input value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} placeholder="Search jobs or companies..."
        className="w-full px-4 py-3 border border-input rounded-lg focus:border-red-700 focus:outline-none bg-background text-foreground" />
    </div>
    <div className="flex flex-wrap gap-2">
      {[
        { key: "location" as const, label: "All Locations", opts: ALL_LOCATIONS },
        { key: "mode" as const, label: "All Modes", opts: ALL_MODES },
        { key: "experience" as const, label: "All Levels", opts: ALL_EXPERIENCES },
        { key: "source" as const, label: "All Sources", opts: ALL_SOURCES },
      ].map(({ key, label, opts }) => (
        <select key={key} value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} aria-label={label} title={label}
          className="px-3 py-2 border border-input rounded-lg text-sm focus:border-red-700 focus:outline-none bg-background text-foreground">
          <option value="">{label}</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
      <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} aria-label="Filter by status" title="Filter by status"
        className="px-3 py-2 border border-input rounded-lg text-sm focus:border-red-700 focus:outline-none bg-background text-foreground">
        <option value="">All Statuses</option>
        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))} aria-label="Sort jobs" title="Sort jobs"
        className="px-3 py-2 border border-input rounded-lg text-sm focus:border-red-700 focus:outline-none bg-background text-foreground">
        <option>Latest</option>
        <option>Match Score</option>
        <option>Salary: High to Low</option>
      </select>
      <button onClick={() => setFilters({ keyword: "", location: "", mode: "", experience: "", source: "", sort: "Latest", status: "" })}
        className="px-3 py-2 border border-input text-muted-foreground rounded-lg text-sm hover:bg-muted font-medium">Reset</button>
    </div>
  </div>
);

export default FilterBar;
