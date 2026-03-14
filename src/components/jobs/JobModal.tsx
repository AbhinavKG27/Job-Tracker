import { X } from "lucide-react";
import { type Job } from "@/lib/jobsData";
import { type JobStatus } from "@/lib/jobStatus";
import StatusButtonGroup from "./StatusButtonGroup";

interface JobModalProps {
  job: Job | null;
  isSaved: boolean;
  currentStatus: JobStatus;
  onClose: () => void;
  onToggleSave: (jobId: number) => void;
  onStatusChange: (jobId: number, jobTitle: string, company: string, status: JobStatus) => void;
}

const JobModal = ({ job, isSaved, currentStatus, onClose, onToggleSave, onStatusChange }: JobModalProps) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
            <p className="text-muted-foreground">{job.company}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close modal" title="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[["Location", job.location], ["Mode", job.mode], ["Experience", job.experience], ["Salary", job.salaryRange]].map(([l, v]) => (
            <div key={l} className="panel p-3">
              <p className="text-xs text-muted-foreground mono-label">{l}</p>
              <p className="text-sm font-medium text-foreground">{v}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Skills Required</p>
          <div className="flex flex-wrap gap-1">{job.skills.map((s, i) => <span key={i} className="chip">{s}</span>)}</div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-1">About the Role</p>
          <p className="text-sm text-muted-foreground">{job.description}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Application Status</p>
          <StatusButtonGroup jobId={job.id} jobTitle={job.title} company={job.company} currentStatus={currentStatus} onStatusChange={onStatusChange} />
        </div>

        <div className="flex gap-3">
          <button onClick={() => { onToggleSave(job.id); onClose(); }} className={`flex-1 ${isSaved ? "btn-primary" : "btn-outline-accent"}`}>
            {isSaved ? "Saved" : "Save Job"}
          </button>
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1">Apply Now</a>
        </div>
      </div>
    </div>
  );
};

export default JobModal;