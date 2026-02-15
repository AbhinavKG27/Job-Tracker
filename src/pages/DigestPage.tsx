import { useState } from "react";
import { Mail, AlertCircle, ExternalLink } from "lucide-react";
import { jobsDataset, type Job } from "@/lib/jobsData";
import { type Preferences, computeMatchScore, getScoreBadgeColor } from "@/lib/matchScore";
import { type StatusUpdate, getStatusBadgeClasses } from "@/lib/jobStatus";

interface DigestPageProps {
  preferences: Preferences | null;
  hasPreferences: boolean;
  statusUpdates: StatusUpdate[];
  setCurrentPage: (page: string) => void;
}

const DigestPage = ({ preferences, hasPreferences, statusUpdates, setCurrentPage }: DigestPageProps) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `jobTrackerDigest_${todayKey}`;

  const [digestJobs, setDigestJobs] = useState<(Job & { matchScore: number })[] | null>(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [copied, setCopied] = useState(false);

  const generateDigest = () => {
    if (!preferences) return;
    const scored = jobsDataset.map(j => ({ ...j, matchScore: computeMatchScore(j, preferences) }));
    scored.sort((a, b) => b.matchScore - a.matchScore || a.postedDaysAgo - b.postedDaysAgo);
    const top10 = scored.slice(0, 10);
    localStorage.setItem(storageKey, JSON.stringify(top10));
    setDigestJobs(top10);
  };

  const formatDigestText = (jobs: (Job & { matchScore: number })[]) => {
    const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    let text = `Top 10 Jobs For You — 9AM Digest\n${dateStr}\n${"─".repeat(40)}\n\n`;
    jobs.forEach((j, i) => {
      text += `${i + 1}. ${j.title} — ${j.company}\n   📍 ${j.location} · ${j.experience} · Match: ${j.matchScore}%\n   🔗 ${j.applyUrl}\n\n`;
    });
    text += `─────────────────────────────────────────\nThis digest was generated based on your preferences.`;
    return text;
  };

  const copyToClipboard = () => {
    if (!digestJobs) return;
    navigator.clipboard.writeText(formatDigestText(digestJobs));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createEmailDraft = () => {
    if (!digestJobs) return;
    const body = encodeURIComponent(formatDigestText(digestJobs));
    window.open(`mailto:?subject=${encodeURIComponent("My 9AM Job Digest")}&body=${body}`);
  };

  if (!hasPreferences) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">Daily Digest</h2>
        <p className="text-sm text-muted-foreground mb-6">Your personalized job digest is delivered every morning.</p>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-foreground font-medium">Set preferences to generate a personalized digest.</p>
          <button onClick={() => setCurrentPage("settings")} className="mt-4 text-sm font-medium text-red-700 hover:underline">Go to Settings →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Daily Digest</h2>
          <p className="text-sm text-muted-foreground">Your personalized job digest is delivered every morning.</p>
        </div>
        <button onClick={generateDigest}
          className="bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
          {digestJobs ? "Regenerate Digest" : "Generate Today's 9AM Digest (Simulated)"}
        </button>
      </div>

      {!digestJobs ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">Click the button above to generate today's digest.</p>
          <p className="text-xs text-muted-foreground mt-3 italic">Demo Mode: Daily 9AM trigger simulated manually.</p>
        </div>
      ) : digestJobs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-medium">No matching roles today. Check again tomorrow.</p>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-2xl p-6 md:p-8">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-red-700 px-6 py-5 text-white">
              <h3 className="text-lg font-bold">Top 10 Jobs For You — 9AM Digest</h3>
              <p className="text-red-200 text-sm mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            <div className="divide-y divide-border">
              {digestJobs.map((job, idx) => {
                const { bg, text } = getScoreBadgeColor(job.matchScore);
                return (
                  <div key={job.id} className="px-6 py-4 flex items-center gap-4">
                    <span className="text-sm font-bold text-muted-foreground w-6 shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground truncate">{job.title}</p>
                        <span className={`${bg} ${text} text-xs font-bold px-2 py-0.5 rounded-full`}>{job.matchScore}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.company} · {job.location} · {job.experience}</p>
                    </div>
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
                      className="bg-red-700 text-white hover:bg-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 flex items-center gap-1">
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-muted/50 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">This digest was generated based on your preferences.</p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={copyToClipboard}
              className="flex-1 border border-border text-foreground hover:bg-muted px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
              {copied ? "✓ Copied!" : "Copy Digest to Clipboard"}
            </button>
            <button onClick={createEmailDraft}
              className="flex-1 border border-red-700 text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
              Create Email Draft
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4 italic">Demo Mode: Daily 9AM trigger simulated manually.</p>
        </div>
      )}

      {/* Recent Status Updates Section */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-foreground mb-1">Recent Status Updates</h3>
        <p className="text-sm text-muted-foreground mb-4">Your recent job application status changes.</p>
        {statusUpdates.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {statusUpdates.slice(0, 15).map((update, idx) => (
                <div key={idx} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{update.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">{update.company}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClasses(update.status)}`}>
                    {update.status}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(update.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground">No status updates yet. Change a job's status to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigestPage;
