import { useTestChecklist } from "@/hooks/useTestChecklist";
import { useProofSubmission } from "@/hooks/useProofSubmission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  ClipboardCopy,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Rocket,
  Shield,
} from "lucide-react";

const Proof = () => {
  const { allPassed, passedCount, total } = useTestChecklist();
  const {
    links,
    errors,
    updateLink,
    validateAll,
    shipStatus,
    steps,
    getSubmissionText,
  } = useProofSubmission(allPassed);

  const handleCopySubmission = () => {
    if (!validateAll()) {
      toast.error("Please fix all validation errors before copying.");
      return;
    }
    if (!allPassed) {
      toast.error(`All ${total} test checklist items must be passed first.`);
      return;
    }
    navigator.clipboard.writeText(getSubmissionText());
    toast.success("Final submission copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium proof-badge"
          >
            <FileText className="h-4 w-4" />
            Final Proof
          </div>

          <h1
            className="text-3xl font-bold tracking-tight proof-title"
          >
            Job Notification Tracker
          </h1>

          <p className="mt-2 proof-subtitle">
            Complete all steps and provide deployment links to ship.
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-6 flex justify-center">
          <Badge
            variant="outline"
            className={`px-4 py-1.5 text-sm font-semibold border proof-status-badge proof-status-${shipStatus.toLowerCase().replace(" ", "-")}`}
          >
            {shipStatus === "Shipped" && (
              <Rocket className="mr-1.5 h-3.5 w-3.5" />
            )}
            {shipStatus}
          </Badge>
        </div>

        {/* Step Completion Summary */}
        <Card className="mb-6 border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle
              className="flex items-center gap-2 text-lg proof-card-title"
            >
              <Shield className="h-5 w-5 proof-icon-red" />
              Step Completion Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1 p-4">
            {steps.map((step, idx) => {
              const completed = true;
              return (
                <div
                  key={step.id}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5"
                >
                  {completed ? (
                    <CheckCircle2
                      className="h-4.5 w-4.5 shrink-0 proof-icon-green"
                    />
                  ) : (
                    <Circle
                      className="h-4.5 w-4.5 shrink-0 proof-icon-gray"
                    />
                  )}

                  <span
                    className="flex-1 text-sm font-medium proof-text"
                  >
                    Step {idx + 1}: {step.label}
                  </span>

                  <span
                    className="text-xs font-semibold proof-completed-badge"
                  >
                    Completed
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Artifact Collection */}
        <Card className="mb-6 border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle
              className="flex items-center gap-2 text-lg proof-card-title"
            >
              <ExternalLink className="h-5 w-5 proof-icon-red" />
              Artifact Collection
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold proof-text">
                Lovable Project Link
              </Label>
              <Input
                placeholder="https://lovable.dev/projects/..."
                value={links.lovableProject}
                onChange={(e) => updateLink("lovableProject", e.target.value)}
              />
              {errors.lovableProject && (
                <p className="text-xs proof-error">
                  {errors.lovableProject}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold proof-text">
                GitHub Repository Link
              </Label>
              <Input
                placeholder="https://github.com/username/repo"
                value={links.githubRepo}
                onChange={(e) => updateLink("githubRepo", e.target.value)}
              />
              {errors.githubRepo && (
                <p className="text-xs proof-error">
                  {errors.githubRepo}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold proof-text">
                Deployed URL (Vercel, Netlify or equivalent)
              </Label>
              <Input
                placeholder="https://your-app.vercel.app"
                value={links.deployedUrl}
                onChange={(e) => updateLink("deployedUrl", e.target.value)}
              />
              {errors.deployedUrl && (
                <p className="text-xs proof-error">
                  {errors.deployedUrl}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Checklist Status */}
        <Card className="mb-6 border shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <span
              className="text-sm font-semibold proof-text"
            >
              Test Checklist
            </span>

            <span
              className={`text-sm font-bold ${allPassed ? "proof-passed" : "proof-failed"}`}
            >
              {passedCount}/{total} Passed
            </span>
          </CardContent>
        </Card>

        {/* Copy Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleCopySubmission}
            disabled={shipStatus !== "Shipped"}
            className="gap-2 px-6"
            size="lg"
          >
            <ClipboardCopy className="h-4 w-4" />
            Copy Final Submission
          </Button>
        </div>

        {/* Status Message */}
        {shipStatus !== "Shipped" && (
          <p
            className="mt-4 text-center text-sm font-medium proof-failed"
          >
            Provide all 3 valid links and pass all {total} tests to unlock
            submission.
          </p>
        )}

        {shipStatus === "Shipped" && (
          <p
            className="mt-6 text-center text-sm font-semibold proof-passed"
          >
            Job-Tracker Shipped Successfully.
          </p>
        )}
      </div>
    </div>
  );
};

export default Proof;
