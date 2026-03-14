interface LandingPageProps {
  setCurrentPage: (page: string) => void;
}

const LandingPage = ({ setCurrentPage }: LandingPageProps) => (
  <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center text-center px-6">
    <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight display-title">Stop Missing<br />The Right Jobs.</h1>
    <p className="text-lg text-muted-foreground mb-8 max-w-md">Precision-matched job discovery delivered daily at 9AM.</p>
    <button onClick={() => setCurrentPage("dashboard")} className="btn-primary text-lg">Start Tracking</button>
    <div className="mt-16 grid grid-cols-3 gap-12">
      {[["60+", "Active Jobs"], ["20+", "Companies"], ["4.9★", "User Rating"]].map(([n, l]) => (
        <div key={l} className="text-center"><p className="text-3xl font-bold text-foreground mono-label">{n}</p><p className="text-sm text-muted-foreground">{l}</p></div>
      ))}
    </div>
  </div>
);

export default LandingPage;