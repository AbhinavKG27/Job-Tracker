export type JobStatus = "Not Applied" | "Applied" | "Rejected" | "Selected";

export const ALL_STATUSES: JobStatus[] = ["Not Applied", "Applied", "Rejected", "Selected"];

export interface StatusUpdate {
  jobId: number;
  jobTitle: string;
  company: string;
  status: JobStatus;
  date: string;
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
  updates.unshift(update);
  if (updates.length > 50) updates.length = 50;
  localStorage.setItem(UPDATES_KEY, JSON.stringify(updates));
}

export function getStatusBadgeClasses(status: JobStatus): string {
  switch (status) {
    case "Not Applied":
      return "status-not-applied";
    case "Applied":
      return "status-applied";
    case "Rejected":
      return "status-rejected";
    case "Selected":
      return "status-selected";
    default:
      return "status-not-applied";
  }
}