import { useTestChecklist } from "@/hooks/useTestChecklist";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Rocket, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Ship = () => {
  const { allPassed, passedCount, total } = useTestChecklist();

  if (!allPassed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-md border-0 shadow-xl">
          <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Ship Locked</h1>
            <p className="text-muted-foreground">
              You must pass all {total} tests before shipping.
              <br />
              Currently: <strong>{passedCount}/{total}</strong> passed.
            </p>
            <Link to="/jt/07-test">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go to Test Checklist
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md border-0 shadow-xl">
        <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Rocket className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ready to Ship!</h1>
          <p className="text-muted-foreground">
            All {total} tests passed. Your app is verified and ready for deployment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ship;
