export type JobStatus = "Not Applied" | "Applied" | "Rejected" | "Selected";

export const ALL_STATUSES: JobStatus[] = ["Not Applied", "Applied", "Rejected", "Selected"];

export interface StatusUpdate {
  jobId: number;
  jobTitle: string;
  company: string;
  status: JobStatus;
  date: string; // ISO string
}

const STATUS_KEY = "jobTrackerStatus";
const UPDATES_KEY = "jobTrackerStatusUpdates";

export function loadJobStatuses(): Record<number, JobStatus> {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveJobStatus(jobId: number, status: JobStatus) {
  const statuses = loadJobStatuses();
  statuses[jobId] = status;
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
}

export function getJobStatus(jobId: number): JobStatus {
  const statuses = loadJobStatuses();
  return statuses[jobId] || "Not Applied";
}

export function loadStatusUpdates(): StatusUpdate[] {
  try {
    const raw = localStorage.getItem(UPDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addStatusUpdate(update: StatusUpdate) {
  const updates = loadStatusUpdates();
  updates.unshift(update); // newest first
  // Keep last 50
  if (updates.length > 50) updates.length = 50;
  localStorage.setItem(UPDATES_KEY, JSON.stringify(updates));
}

export function getStatusBadgeClasses(status: JobStatus): string {
  switch (status) {
    case "Not Applied":
      return "bg-muted text-muted-foreground";
    case "Applied":
      return "bg-blue-100 text-blue-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Selected":
      return "bg-green-100 text-green-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}
