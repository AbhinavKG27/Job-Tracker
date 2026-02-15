import { AlertCircle, SlidersHorizontal } from "lucide-react";
import { type Job } from "@/lib/jobsData";
import { type JobStatus } from "@/lib/jobStatus";
import FilterBar, { type Filters } from "@/components/jobs/FilterBar";
import JobCard from "@/components/jobs/JobCard";

interface DashboardPageProps {
  filteredJobs: (Job & { matchScore: number })[];
  hasPreferences: boolean;
  showOnlyMatches: boolean;
  setShowOnlyMatches: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  savedJobs: number[];
  jobStatuses: Record<number, JobStatus>;
  setCurrentPage: (page: string) => void;
  onToggleSave: (jobId: number) => void;
  onViewJob: (job: Job & { matchScore: number }) => void;
  onStatusChange: (jobId: number, jobTitle: string, company: string, status: JobStatus) => void;
}

const DashboardPage = ({
  filteredJobs, hasPreferences, showOnlyMatches, setShowOnlyMatches,
  filters, setFilters, savedJobs, jobStatuses, setCurrentPage,
  onToggleSave, onViewJob, onStatusChange,
}: DashboardPageProps) => (
  <div className="max-w-6xl mx-auto px-6 py-8">
    <FilterBar filters={filters} setFilters={setFilters} />

    {!hasPreferences && (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 flex-1">Set your preferences to activate intelligent matching.</p>
        <button onClick={() => setCurrentPage("settings")} className="text-sm font-medium text-red-700 hover:underline whitespace-nowrap">Go to Settings →</button>
      </div>
    )}

    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">{filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} available</p>
      </div>
      {hasPreferences && (
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-sm text-muted-foreground">Show only matches</span>
          <button onClick={() => setShowOnlyMatches(v => !v)}
            className={`relative w-10 h-6 rounded-full transition-colors ${showOnlyMatches ? "bg-red-700" : "bg-muted"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showOnlyMatches ? "translate-x-4" : ""}`} />
          </button>
        </label>
      )}
    </div>

    {filteredJobs.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            hasPreferences={hasPreferences}
            isSaved={savedJobs.includes(job.id)}
            currentStatus={jobStatuses[job.id] || "Not Applied"}
            onToggleSave={onToggleSave}
            onViewJob={onViewJob}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-20">
        <SlidersHorizontal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">No roles match your criteria.</p>
        <p className="text-sm text-muted-foreground mt-1">Adjust filters or lower threshold.</p>
      </div>
    )}
  </div>
);

export default DashboardPage;
