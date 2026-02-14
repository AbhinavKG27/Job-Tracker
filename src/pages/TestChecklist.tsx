import { useTestChecklist } from "@/hooks/useTestChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle2, HelpCircle, RotateCcw, Shield } from "lucide-react";

const TestChecklist = () => {
  const { items, toggle, reset, passedCount, total, allPassed } = useTestChecklist();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Shield className="h-4 w-4" />
            Quality Gate
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Test Checklist
          </h1>
          <p className="mt-2 text-muted-foreground">
            Verify every feature before shipping.
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              {allPassed ? (
                <CheckCircle2 className="h-8 w-8 text-accent" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-[hsl(var(--warning))]" />
              )}
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {passedCount} / {total}
                </p>
                <p className="text-sm text-muted-foreground">Tests Passed</p>
              </div>
            </div>

            {!allPassed && (
              <span className="rounded-md bg-[hsl(var(--warning)/0.12)] px-3 py-1.5 text-xs font-medium text-[hsl(var(--warning))]">
                Resolve all issues before shipping.
              </span>
            )}

            {allPassed && (
              <span className="rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                Ready to ship! 🚀
              </span>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Feature Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-4">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                  item.checked ? "bg-accent/5" : ""
                }`}
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggle(item.id)}
                  className="pointer-events-none"
                />
                <span
                  className={`flex-1 text-sm ${
                    item.checked
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {idx + 1}. {item.label}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="text-muted-foreground/60 hover:text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-xs">
                    {item.hint}
                  </TooltipContent>
                </Tooltip>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Reset */}
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={reset} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Test Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestChecklist;
