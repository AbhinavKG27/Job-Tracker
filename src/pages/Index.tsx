import { useState, useMemo, useCallback } from "react";
import { jobsDataset, type Job } from "@/lib/jobsData";
import { type Preferences, loadPreferences, computeMatchScore } from "@/lib/matchScore";
import {
  type JobStatus,
  loadJobStatuses,
  saveJobStatus,
  loadStatusUpdates,
  addStatusUpdate,
  type StatusUpdate,
} from "@/lib/jobStatus";
import { useToast } from "@/hooks/use-toast";
import { type Filters } from "@/components/jobs/FilterBar";

import Navigation from "@/components/layout/Navigation";
import JobModal from "@/components/jobs/JobModal";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import SavedPage from "@/pages/SavedPage";
import DigestPage from "@/pages/DigestPage";
import SettingsPage from "@/pages/SettingsPage";
import Proof from "@/pages/Proof";

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
  const [filters, setFilters] = useState<Filters>({ keyword: "", location: "", mode: "", experience: "", source: "", sort: "Latest", status: "" });

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

  const jobsWithScores = useMemo(() => {
    return jobsDataset.map(job => ({
      ...job,
      matchScore: preferences ? computeMatchScore(job, preferences) : 0,
    }));
  }, [preferences]);

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

  const handleViewJob = useCallback((job: Job & { matchScore: number }) => {
    setSelectedJob(job);
    setShowModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === "/" && <LandingPage setCurrentPage={setCurrentPage} />}
      {currentPage === "dashboard" && (
        <DashboardPage
          filteredJobs={filteredJobs}
          hasPreferences={hasPreferences}
          showOnlyMatches={showOnlyMatches}
          setShowOnlyMatches={setShowOnlyMatches}
          filters={filters}
          setFilters={setFilters}
          savedJobs={savedJobs}
          jobStatuses={jobStatuses}
          setCurrentPage={setCurrentPage}
          onToggleSave={toggleSaveJob}
          onViewJob={handleViewJob}
          onStatusChange={handleStatusChange}
        />
      )}
      {currentPage === "saved" && (
        <SavedPage
          savedJobs={savedJobs}
          jobsWithScores={jobsWithScores}
          hasPreferences={hasPreferences}
          jobStatuses={jobStatuses}
          onToggleSave={toggleSaveJob}
          onViewJob={handleViewJob}
          onStatusChange={handleStatusChange}
        />
      )}
      {currentPage === "digest" && (
        <DigestPage
          preferences={preferences}
          hasPreferences={hasPreferences}
          statusUpdates={statusUpdates}
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === "settings" && (
        <SettingsPage preferences={preferences} setPreferences={setPreferences} />
      )}
      {currentPage === "proof" && <Proof />}
      {showModal && (
        <JobModal
          job={selectedJob}
          isSaved={selectedJob ? savedJobs.includes(selectedJob.id) : false}
          currentStatus={selectedJob ? (jobStatuses[selectedJob.id] || "Not Applied") : "Not Applied"}
          onClose={() => setShowModal(false)}
          onToggleSave={toggleSaveJob}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
