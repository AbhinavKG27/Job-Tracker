import React from "react";
import { Heart, ExternalLink } from "lucide-react";
import { type Job } from "@/lib/jobsData";
import { type JobStatus } from "@/lib/jobStatus";
import ScoreBadge from "./ScoreBadge";
import StatusButtonGroup from "./StatusButtonGroup";

interface JobCardProps {
  job: Job & { matchScore: number };
  hasPreferences: boolean;
  isSaved: boolean;
  currentStatus: JobStatus;
  onToggleSave: (jobId: number) => void;
  onViewJob: (job: Job & { matchScore: number }) => void;
  onStatusChange: (jobId: number, jobTitle: string, company: string, status: JobStatus) => void;
}

const JobCard = React.memo(({ job, hasPreferences, isSaved, currentStatus, onToggleSave, onViewJob, onStatusChange }: JobCardProps) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
          {hasPreferences && <ScoreBadge score={job.matchScore} />}
        </div>
        <p className="text-sm text-muted-foreground">{job.company}</p>
      </div>
      <button onClick={() => onToggleSave(job.id)} className="text-muted-foreground hover:text-[var(--accent-coral)] transition-colors ml-2" aria-label="Toggle save job" title="Toggle save job">
        <Heart className={`w-5 h-5 ${isSaved ? "fill-[var(--accent-coral)] text-[var(--accent-coral)]" : ""}`} />
      </button>
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 mono-label">
      <span>{job.location}</span><span>•</span><span>{job.mode}</span><span>•</span><span>{job.experience}</span>
    </div>
    <div className="mb-3">
      <p className="text-sm font-medium text-foreground mono-label">{job.salaryRange}</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {job.skills.slice(0, 3).map((s, i) => (
          <span key={i} className="chip">{s}</span>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
      <div className="flex items-center gap-2">
        <span className="chip">{job.source}</span>
        <span>{job.postedDaysAgo === 0 ? "Today" : `${job.postedDaysAgo}d ago`}</span>
      </div>
    </div>

    <div className="mb-3">
      <StatusButtonGroup jobId={job.id} jobTitle={job.title} company={job.company} currentStatus={currentStatus} onStatusChange={onStatusChange} />
    </div>

    <div className="flex gap-2">
      <button onClick={() => onViewJob(job)} className="btn-outline-accent flex-1">View</button>
      <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-center">
        Apply <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </div>
));

JobCard.displayName = "JobCard";

export default JobCard;