import { Bookmark } from "lucide-react";
import { type Job } from "@/lib/jobsData";
import { type JobStatus } from "@/lib/jobStatus";
import JobCard from "@/components/jobs/JobCard";

interface SavedPageProps {
  savedJobs: number[];
  jobsWithScores: (Job & { matchScore: number })[];
  hasPreferences: boolean;
  jobStatuses: Record<number, JobStatus>;
  onToggleSave: (jobId: number) => void;
  onViewJob: (job: Job & { matchScore: number }) => void;
  onStatusChange: (jobId: number, jobTitle: string, company: string, status: JobStatus) => void;
}

const SavedPage = ({ savedJobs, jobsWithScores, hasPreferences, jobStatuses, onToggleSave, onViewJob, onStatusChange }: SavedPageProps) => {
  const saved = jobsWithScores.filter(j => savedJobs.includes(j.id));
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Saved Jobs</h2>
      <p className="text-sm text-muted-foreground mb-6">Your collection of bookmarked opportunities.</p>
      {saved.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map(j => (
            <JobCard
              key={j.id}
              job={j}
              hasPreferences={hasPreferences}
              isSaved={true}
              currentStatus={jobStatuses[j.id] || "Not Applied"}
              onToggleSave={onToggleSave}
              onViewJob={onViewJob}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No saved jobs yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Click the heart icon on any job to save it.</p>
        </div>
      )}
    </div>
  );
};

export default SavedPage;
