import { Job } from "./jobsData";

export interface Preferences {
  roleKeywords: string[];
  preferredLocations: string[];
  preferredMode: string[];
  experienceLevel: string;
  skills: string[];
  minMatchScore: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  roleKeywords: [],
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: "",
  skills: [],
  minMatchScore: 40,
};

export function loadPreferences(): Preferences | null {
  try {
    const raw = localStorage.getItem("jobTrackerPreferences");
    if (!raw) return null;
    return JSON.parse(raw) as Preferences;
  } catch {
    return null;
  }
}

export function savePreferences(prefs: Preferences) {
  localStorage.setItem("jobTrackerPreferences", JSON.stringify(prefs));
}

export function computeMatchScore(job: Job, prefs: Preferences): number {
  let score = 0;
  const titleLower = job.title.toLowerCase();
  const descLower = job.description.toLowerCase();

  if (prefs.roleKeywords.some(kw => kw && titleLower.includes(kw.toLowerCase()))) {
    score += 25;
  }

  if (prefs.roleKeywords.some(kw => kw && descLower.includes(kw.toLowerCase()))) {
    score += 15;
  }

  if (prefs.preferredLocations.length > 0 && prefs.preferredLocations.includes(job.location)) {
    score += 15;
  }

  if (prefs.preferredMode.length > 0 && prefs.preferredMode.includes(job.mode)) {
    score += 10;
  }

  if (prefs.experienceLevel && job.experience === prefs.experienceLevel) {
    score += 10;
  }

  if (prefs.skills.length > 0) {
    const userSkillsLower = prefs.skills.map(s => s.toLowerCase());
    if (job.skills.some(s => userSkillsLower.includes(s.toLowerCase()))) {
      score += 15;
    }
  }

  if (job.postedDaysAgo <= 2) {
    score += 5;
  }

  if (job.source === "LinkedIn") {
    score += 5;
  }

  return Math.min(score, 100);
}

export function getScoreBadgeColor(score: number): { bg: string; text: string } {
  if (score >= 80) return { bg: "bg-[var(--accent-soft)]", text: "text-[var(--accent-coral)]" };
  if (score >= 60) return { bg: "bg-[var(--accent-pink-soft)]", text: "text-foreground" };
  if (score >= 40) return { bg: "bg-muted", text: "text-muted-foreground" };
  return { bg: "bg-background", text: "text-[var(--text-3)]" };
}