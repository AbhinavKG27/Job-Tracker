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
          className={`status-chip mono-label font-medium ${
            currentStatus === status
              ? getStatusBadgeClasses(status)
              : "bg-background text-muted-foreground border-input"
          }`}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

export default StatusButtonGroup;