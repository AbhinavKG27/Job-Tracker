import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Settings, Bookmark, Mail, FileText, Home, ExternalLink, Heart, X, ChevronDown, AlertCircle, SlidersHorizontal } from "lucide-react";
import { jobsDataset, ALL_LOCATIONS, ALL_MODES, ALL_EXPERIENCES, ALL_SOURCES, type Job } from "@/lib/jobsData";
import { Preferences, DEFAULT_PREFERENCES, loadPreferences, savePreferences, computeMatchScore, getScoreBadgeColor } from "@/lib/matchScore";
import {
  type JobStatus,
  ALL_STATUSES,
  loadJobStatuses,
  saveJobStatus,
  getJobStatus,
  getStatusBadgeClasses,
  loadStatusUpdates,
  addStatusUpdate,
  type StatusUpdate,
} from "@/lib/jobStatus";
import { useToast } from "@/hooks/use-toast";
import Proof from "@/pages/Proof";
import { useTestChecklist } from "@/hooks/useTestChecklist";
import { useProofSubmission } from "@/hooks/useProofSubmission";

export default function Index() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState("/");
  const [savedJobs, setSavedJobs] = useState<number[]>(() => {
    try { const s = localStorage.getItem("savedJobs"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const [preferences, setPreferences] = useState<Preferences | null>(() => loadPreferences());
  const [jobStatuses, setJobStatuses] = useState<Record<number, JobStatus>>(() => loadJobStatuses());
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>(() => loadStatusUpdates());

  const [filters, setFilters] = useState({ keyword: "", location: "", mode: "", experience: "", source: "", sort: "Latest", status: "" });

  const toggleSaveJob = useCallback((jobId: number) => {
    setSavedJobs(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      localStorage.setItem("savedJobs", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleStatusChange = useCallback((jobId: number, jobTitle: string, company: string, status: JobStatus) => {
    saveJobStatus(jobId, status);
    setJobStatuses(prev => ({ ...prev, [jobId]: status }));

    if (status !== "Not Applied") {
      const update: StatusUpdate = {
        jobId,
        jobTitle,
        company,
        status,
        date: new Date().toISOString(),
      };
      addStatusUpdate(update);
      setStatusUpdates(loadStatusUpdates());
      toast({
        title: `Status updated: ${status}`,
        description: `${jobTitle} at ${company}`,
      });
    }
  }, [toast]);

  // Compute scores for all jobs
  const jobsWithScores = useMemo(() => {
    return jobsDataset.map(job => ({
      ...job,
      matchScore: preferences ? computeMatchScore(job, preferences) : 0,
    }));
  }, [preferences]);

  // Filter and sort
  const filteredJobs = useMemo(() => {
    let result = [...jobsWithScores];

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(j => j.title.toLowerCase().includes(kw) || j.company.toLowerCase().includes(kw));
    }
    if (filters.location) result = result.filter(j => j.location === filters.location);
    if (filters.mode) result = result.filter(j => j.mode === filters.mode);
    if (filters.experience) result = result.filter(j => j.experience === filters.experience);
    if (filters.source) result = result.filter(j => j.source === filters.source);

    // Status filter
    if (filters.status) {
      result = result.filter(j => (jobStatuses[j.id] || "Not Applied") === filters.status);
    }

    if (showOnlyMatches && preferences) {
      result = result.filter(j => j.matchScore >= preferences.minMatchScore);
    }

    if (filters.sort === "Latest") result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    else if (filters.sort === "Match Score") result.sort((a, b) => b.matchScore - a.matchScore);
    else if (filters.sort === "Salary: High to Low") {
      result.sort((a, b) => {
        const extract = (s: string) => { const m = s.match(/(\d+)/g); return m ? Math.max(...m.map(Number)) : 0; };
        return extract(b.salaryRange) - extract(a.salaryRange);
      });
    }

    return result;
  }, [jobsWithScores, filters, showOnlyMatches, preferences, jobStatuses]);

  const hasPreferences = preferences !== null && (preferences.roleKeywords.length > 0 || preferences.skills.length > 0 || preferences.preferredLocations.length > 0);

  // ── Status Button Group ──
  const StatusButtonGroup = ({ jobId, jobTitle, company }: { jobId: number; jobTitle: string; company: string }) => {
    const currentStatus = jobStatuses[jobId] || "Not Applied";
    return (
      <div className="flex flex-wrap gap-1">
        {ALL_STATUSES.map(status => (
          <button
            key={status}
            onClick={(e) => { e.stopPropagation(); handleStatusChange(jobId, jobTitle, company, status); }}
            className={`text-xs px-2 py-1 rounded-full font-medium transition-colors border ${
              currentStatus === status
                ? getStatusBadgeClasses(status) + " border-transparent"
                : "bg-background text-muted-foreground border-input hover:border-foreground/30"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    );
  };

  // ── Navigation ──
  const Navigation = () => (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => setCurrentPage("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-red-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">JNT</div>
          <span className="font-semibold text-foreground hidden sm:inline">Job Tracker</span>
        </button>
        <div className="flex items-center gap-6">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "saved", label: "Saved" },
            { key: "digest", label: "Digest" },
            { key: "settings", label: "Settings" },
            { key: "proof", label: "Proof" },
          ].map(p => (
            <button key={p.key} onClick={() => setCurrentPage(p.key)}
              className={`text-sm font-medium transition-colors ${currentPage === p.key ? "text-red-700" : "text-muted-foreground hover:text-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  // ── Score Badge ──
  const ScoreBadge = ({ score }: { score: number }) => {
    const { bg, text } = getScoreBadgeColor(score);
    return <span className={`${bg} ${text} text-xs font-bold px-2 py-0.5 rounded-full`}>{score}%</span>;
  };

  // ── Job Card ──
  const JobCard = React.memo(({ job }: { job: Job & { matchScore: number } }) => (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
            {hasPreferences && <ScoreBadge score={job.matchScore} />}
          </div>
          <p className="text-sm text-muted-foreground">{job.company}</p>
        </div>
        <button onClick={() => toggleSaveJob(job.id)} className="text-muted-foreground hover:text-red-700 transition-colors ml-2" aria-label="Toggle save job" title="Toggle save job">
          <Heart className={`w-5 h-5 ${savedJobs.includes(job.id) ? "fill-red-700 text-red-700" : ""}`} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <span>{job.location}</span><span>•</span><span>{job.mode}</span><span>•</span><span>{job.experience}</span>
      </div>
      <div className="mb-3">
        <p className="text-sm font-medium text-foreground">{job.salaryRange}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {job.skills.slice(0, 3).map((s, i) => (
            <span key={i} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-muted px-2 py-0.5 rounded">{job.source}</span>
          <span>{job.postedDaysAgo === 0 ? "Today" : `${job.postedDaysAgo}d ago`}</span>
        </div>
      </div>

      {/* Status Button Group */}
      <div className="mb-3">
        <StatusButtonGroup jobId={job.id} jobTitle={job.title} company={job.company} />
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setSelectedJob(job); setShowModal(true); }}
          className="flex-1 border border-red-700 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors">View</button>
        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 bg-red-700 text-white hover:bg-red-800 px-4 py-2 rounded-lg font-medium text-sm transition-colors text-center flex items-center justify-center gap-1">
          Apply <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  ));

  // ── Modal ──
  const JobModal = ({ job, onClose }: { job: Job | null; onClose: () => void }) => {
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
            <StatusButtonGroup jobId={job.id} jobTitle={job.title} company={job.company} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { toggleSaveJob(job.id); onClose(); }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${savedJobs.includes(job.id) ? "bg-red-700 text-white hover:bg-red-800" : "border border-red-700 text-red-700 hover:bg-red-50"}`}>
              {savedJobs.includes(job.id) ? "Saved" : "Save Job"}
            </button>
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-red-700 text-white hover:bg-red-800 px-4 py-3 rounded-lg font-medium text-center">Apply Now</a>
          </div>
        </div>
      </div>
    );
  };

  // ── Filter Bar ──
  const FilterBar = () => (
    <div className="bg-card border border-border rounded-xl p-5 mb-6">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground mb-2">Search & Filter</p>
        <input value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} placeholder="Search jobs or companies..."
          className="w-full px-4 py-3 border border-input rounded-lg focus:border-red-700 focus:outline-none bg-background text-foreground" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { key: "location" as const, label: "All Locations", opts: ALL_LOCATIONS },
          { key: "mode" as const, label: "All Modes", opts: ALL_MODES },
          { key: "experience" as const, label: "All Levels", opts: ALL_EXPERIENCES },
          { key: "source" as const, label: "All Sources", opts: ALL_SOURCES },
        ].map(({ key, label, opts }) => (
          <select key={key} value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} aria-label={label} title={label}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:border-red-700 focus:outline-none bg-background text-foreground">
            <option value="">{label}</option>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {/* Status Filter */}
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} aria-label="Filter by status" title="Filter by status"
          className="px-3 py-2 border border-input rounded-lg text-sm focus:border-red-700 focus:outline-none bg-background text-foreground">
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))} aria-label="Sort jobs" title="Sort jobs"
          className="px-3 py-2 border border-input rounded-lg text-sm focus:border-red-700 focus:outline-none bg-background text-foreground">
          <option>Latest</option>
          <option>Match Score</option>
          <option>Salary: High to Low</option>
        </select>
        <button onClick={() => setFilters({ keyword: "", location: "", mode: "", experience: "", source: "", sort: "Latest", status: "" })}
          className="px-3 py-2 border border-input text-muted-foreground rounded-lg text-sm hover:bg-muted font-medium">Reset</button>
      </div>
    </div>
  );

  // ── Landing ──
  const LandingPage = () => (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">Stop Missing<br />The Right Jobs.</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">Precision-matched job discovery delivered daily at 9AM.</p>
      <button onClick={() => setCurrentPage("dashboard")}
        className="bg-red-700 hover:bg-red-800 text-white px-10 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg hover:shadow-xl">Start Tracking</button>
      <div className="mt-16 grid grid-cols-3 gap-12">
        {[["60+", "Active Jobs"], ["20+", "Companies"], ["4.9★", "User Rating"]].map(([n, l]) => (
          <div key={l} className="text-center"><p className="text-3xl font-bold text-foreground">{n}</p><p className="text-sm text-muted-foreground">{l}</p></div>
        ))}
      </div>
    </div>
  );

  // ── Dashboard ──
  const DashboardPage = () => (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <FilterBar />

      {!hasPreferences && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">Set your preferences to activate intelligent matching.</p>
          <button onClick={() => setCurrentPage("settings")} className="text-sm font-medium text-red-700 hover:underline whitespace-nowrap">Go to Settings →</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">{filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} available</p>
        </div>
        {hasPreferences && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-muted-foreground">Show only matches</span>
            <button onClick={() => setShowOnlyMatches(v => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${showOnlyMatches ? "bg-red-700" : "bg-muted"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showOnlyMatches ? "translate-x-4" : ""}`} />
            </button>
          </label>
        )}
      </div>

      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <SlidersHorizontal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No roles match your criteria.</p>
          <p className="text-sm text-muted-foreground mt-1">Adjust filters or lower threshold.</p>
        </div>
      )}
    </div>
  );

  // ── Saved ──
  const SavedPage = () => {
    const saved = jobsWithScores.filter(j => savedJobs.includes(j.id));
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">Saved Jobs</h2>
        <p className="text-sm text-muted-foreground mb-6">Your collection of bookmarked opportunities.</p>
        {saved.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {saved.map(j => <JobCard key={j.id} job={j} />)}
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

  // ── Digest ──
  const DigestPage = () => {
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
            {/* Email-style card */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-red-700 px-6 py-5 text-white">
                <h3 className="text-lg font-bold">Top 10 Jobs For You — 9AM Digest</h3>
                <p className="text-red-200 text-sm mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>

              {/* Job list */}
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

              {/* Footer */}
              <div className="px-6 py-4 bg-muted/50 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">This digest was generated based on your preferences.</p>
              </div>
            </div>

            {/* Action buttons */}
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

  // ── Settings ──
  const SettingsPage = () => {
  const [form, setForm] = useState<Preferences>(() => preferences ?? DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  // NEW: Raw input states (prevents comma typing bug)
  const [roleKeywordsInput, setRoleKeywordsInput] = useState(
    () => (preferences?.roleKeywords?.join(", ") || "")
  );

  const [skillsInput, setSkillsInput] = useState(
    () => (preferences?.skills?.join(", ") || "")
  );

  useEffect(() => {
    if (preferences) {
      setRoleKeywordsInput(preferences.roleKeywords?.join(", ") || "");
      setSkillsInput(preferences.skills?.join(", ") || "");
    }
  }, [preferences]);

  const handleSave = (e?: React.FormEvent) => {
  if (e) e.preventDefault(); // prevents spam clicks

  const parsedRoleKeywords = roleKeywordsInput
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const parsedSkills = skillsInput
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const updatedForm = {
    ...form,
    roleKeywords: parsedRoleKeywords,
    skills: parsedSkills,
  };

  savePreferences(updatedForm);
  setPreferences(updatedForm);
  setForm(updatedForm);

  setSaved(true);
  setTimeout(() => setSaved(false), 2000);
};


  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Preferences</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Configure your job matching preferences.
      </p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Role Keywords */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Role Keywords{" "}
            <span className="text-muted-foreground font-normal">
              (comma-separated)
            </span>
          </label>
          <input
            value={roleKeywordsInput}
            onChange={(e) => setRoleKeywordsInput(e.target.value)}
            placeholder="e.g. SDE, Backend, Frontend, Intern"
            title="Role Keywords"
            className="w-full px-4 py-3 border border-input rounded-lg focus:border-red-700 focus:outline-none bg-background text-foreground"
          />
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Preferred Locations
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    preferredLocations: f.preferredLocations.includes(loc)
                      ? f.preferredLocations.filter((l) => l !== loc)
                      : [...f.preferredLocations, loc],
                  }))
                }
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  form.preferredLocations.includes(loc)
                    ? "bg-red-700 text-white border-red-700"
                    : "bg-background text-muted-foreground border-input hover:border-red-700"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Mode */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Work Mode
          </label>
          <div className="flex flex-wrap gap-3">
            {ALL_MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.preferredMode.includes(mode)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      preferredMode: e.target.checked
                        ? [...f.preferredMode, mode]
                        : f.preferredMode.filter((m) => m !== mode),
                    }))
                  }
                  className="w-4 h-4 accent-red-700"
                />
                <span className="text-sm text-foreground">{mode}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Experience Level
          </label>
          <select
            value={form.experienceLevel}
            onChange={(e) =>
              setForm((f) => ({ ...f, experienceLevel: e.target.value }))
            }
            aria-label="Experience Level"
            className="w-full px-4 py-3 border border-input rounded-lg focus:border-red-700 focus:outline-none bg-background text-foreground"
          >
            <option value="">Any</option>
            {ALL_EXPERIENCES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Skills{" "}
            <span className="text-muted-foreground font-normal">
              (comma-separated)
            </span>
          </label>
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. React, Python, Java, SQL"
            className="w-full px-4 py-3 border border-input rounded-lg focus:border-red-700 focus:outline-none bg-background text-foreground"
          />
        </div>

        {/* Min Match Score */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Minimum Match Score:{" "}
            <span className="text-red-700">{form.minMatchScore}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={form.minMatchScore}
            aria-label="Set minimum match score"
            title="Set minimum match score"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                minMatchScore: Number(e.target.value),
              }))
            }
            className="w-full accent-red-700"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <button
          type="button"  // ⭐ THIS FIXES THE SCROLL BUG
          onClick={handleSave}
          className="w-full bg-red-700 hover:bg-red-800 text-white py-3 rounded-lg font-medium transition-colors">
            {saved ? "✓ Preferences Saved!" : "Save Preferences"}
        </button>

      </div>
    </div>
  );
};


  // ── Render ──
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {currentPage === "/" && <LandingPage />}
      {currentPage === "dashboard" && <DashboardPage />}
      {currentPage === "saved" && <SavedPage />}
      {currentPage === "digest" && <DigestPage />}
      {currentPage === "settings" && <SettingsPage />}
      {currentPage === "proof" && <Proof />}
      {showModal && <JobModal job={selectedJob} onClose={() => setShowModal(false)} />}
    </div>
  );
}
