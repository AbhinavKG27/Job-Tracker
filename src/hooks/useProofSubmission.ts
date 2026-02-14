import { useState, useCallback, useEffect } from "react";
import { z } from "zod";

const urlSchema = z.string().trim().url({ message: "Please enter a valid URL" });

export interface ProofLinks {
  lovableProject: string;
  githubRepo: string;
  deployedUrl: string;
}

export interface ProofErrors {
  lovableProject: string;
  githubRepo: string;
  deployedUrl: string;
}

const STORAGE_KEY = "jt-proof-links";

const STEPS = [
  { id: "step-1", label: "Project Setup & Configuration", route: "/" },
  { id: "step-2", label: "Preferences System", route: "/" },
  { id: "step-3", label: "Match Scoring Engine", route: "/" },
  { id: "step-4", label: "Job Filtering & Display", route: "/" },
  { id: "step-5", label: "Save & Apply Actions", route: "/" },
  { id: "step-6", label: "Status Tracking Pipeline", route: "/" },
  { id: "step-7", label: "Daily Digest Simulation", route: "/" },
  { id: "step-8", label: "Test Checklist & Ship Lock", route: "/jt/07-test" },
] as const;

type ShipStatus = "Not Started" | "In Progress" | "Shipped";

export function useProofSubmission(allTestsPassed: boolean) {
  const [links, setLinks] = useState<ProofLinks>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { lovableProject: "", githubRepo: "", deployedUrl: "" };
  });

  const [errors, setErrors] = useState<ProofErrors>({
    lovableProject: "",
    githubRepo: "",
    deployedUrl: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  const updateLink = useCallback((field: keyof ProofLinks, value: string) => {
    setLinks((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validateField = useCallback((field: keyof ProofLinks): boolean => {
    const value = links[field].trim();
    if (!value) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required" }));
      return false;
    }
    const result = urlSchema.safeParse(value);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [field]: result.error.errors[0].message }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
    return true;
  }, [links]);

  const validateAll = useCallback((): boolean => {
    const fields: (keyof ProofLinks)[] = ["lovableProject", "githubRepo", "deployedUrl"];
    return fields.map(validateField).every(Boolean);
  }, [validateField]);

  const allLinksProvided =
    links.lovableProject.trim() !== "" &&
    links.githubRepo.trim() !== "" &&
    links.deployedUrl.trim() !== "" &&
    urlSchema.safeParse(links.lovableProject.trim()).success &&
    urlSchema.safeParse(links.githubRepo.trim()).success &&
    urlSchema.safeParse(links.deployedUrl.trim()).success;

  const shipStatus: ShipStatus = (() => {
    if (allLinksProvided && allTestsPassed) return "Shipped";
    if (links.lovableProject || links.githubRepo || links.deployedUrl) return "In Progress";
    return "Not Started";
  })();

  const getSubmissionText = useCallback((): string => {
    return `Job Notification Tracker — Final Submission

Lovable Project:
${links.lovableProject.trim()}

GitHub Repository:
${links.githubRepo.trim()}

Live Deployment:
${links.deployedUrl.trim()}

Core Features:
- Intelligent match scoring
- Daily digest simulation
- Status tracking
- Test checklist enforced`;
  }, [links]);

  return {
    links,
    errors,
    updateLink,
    validateField,
    validateAll,
    allLinksProvided,
    allTestsPassed,
    shipStatus,
    steps: STEPS,
    getSubmissionText,
  };
}