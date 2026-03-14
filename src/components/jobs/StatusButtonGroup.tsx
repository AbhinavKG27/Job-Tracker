import { ALL_STATUSES, type JobStatus, getStatusBadgeClasses } from "@/lib/jobStatus";

interface StatusButtonGroupProps {
  jobId: number;
  jobTitle: string;
  company: string;
  currentStatus: JobStatus;
  onStatusChange: (jobId: number, jobTitle: string, company: string, status: JobStatus) => void;
}

const StatusButtonGroup = ({ jobId, jobTitle, company, currentStatus, onStatusChange }: StatusButtonGroupProps) => {
  return (
    <div className="flex flex-wrap gap-1">
      {ALL_STATUSES.map(status => (
        <button
          key={status}
          onClick={(e) => { e.stopPropagation(); onStatusChange(jobId, jobTitle, company, status); }}
          className={`text-xs px-2 py-1 rounded-full font-medium transition-colors border mono-label ${
            currentStatus === status
              ? getStatusBadgeClasses(status) + " border-transparent"
              : "bg-background text-muted-foreground border-input hover:border-[var(--accent-coral)]"
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default StatusButtonGroup;