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
      <div className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div><h2 className="text-xl font-bold text-foreground">{job.title}</h2><p className="text-muted-foreground">{job.company}</p></div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close modal" title="Close modal"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[["Location", job.location], ["Mode", job.mode], ["Experience", job.experience], ["Salary", job.salaryRange]].map(([l, v]) => (
            <div key={l} className="bg-muted rounded-lg p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="text-sm font-medium text-foreground">{v}</p></div>
          ))}
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Skills Required</p>
          <div className="flex flex-wrap gap-1">{job.skills.map((s, i) => <span key={i} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">{s}</span>)}</div>
        </div>
        <div className="mb-4"><p className="text-sm font-medium text-foreground mb-1">About the Role</p><p className="text-sm text-muted-foreground">{job.description}</p></div>
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground mb-2">Application Status</p>
          <StatusButtonGroup jobId={job.id} jobTitle={job.title} company={job.company} currentStatus={currentStatus} onStatusChange={onStatusChange} />
        </div>
        <div className="flex gap-3">
          <button onClick={() => { onToggleSave(job.id); onClose(); }}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${isSaved ? "bg-red-700 text-white hover:bg-red-800" : "border border-red-700 text-red-700 hover:bg-red-50"}`}>
            {isSaved ? "Saved" : "Save Job"}
          </button>
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-red-700 text-white hover:bg-red-800 px-4 py-3 rounded-lg font-medium text-center">Apply Now</a>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
