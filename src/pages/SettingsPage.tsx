import React, { useState, useEffect } from "react";
import { ALL_LOCATIONS, ALL_MODES, ALL_EXPERIENCES } from "@/lib/jobsData";
import { type Preferences, DEFAULT_PREFERENCES, savePreferences } from "@/lib/matchScore";

interface SettingsPageProps {
  preferences: Preferences | null;
  setPreferences: (prefs: Preferences) => void;
}

const SettingsPage = ({ preferences, setPreferences }: SettingsPageProps) => {
  const [form, setForm] = useState<Preferences>(() => preferences ?? DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  const [roleKeywordsInput, setRoleKeywordsInput] = useState(() => (preferences?.roleKeywords?.join(", ") || ""));
  const [skillsInput, setSkillsInput] = useState(() => (preferences?.skills?.join(", ") || ""));

  useEffect(() => {
    if (preferences) {
      setRoleKeywordsInput(preferences.roleKeywords?.join(", ") || "");
      setSkillsInput(preferences.skills?.join(", ") || "");
    }
  }, [preferences]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const parsedRoleKeywords = roleKeywordsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const parsedSkills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);

    const updatedForm = { ...form, roleKeywords: parsedRoleKeywords, skills: parsedSkills };

    savePreferences(updatedForm);
    setPreferences(updatedForm);
    setForm(updatedForm);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-foreground mb-1">Preferences</h2>
      <p className="text-sm text-muted-foreground mb-6">Configure your job matching preferences.</p>

      <div className="card p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Role Keywords <span className="text-muted-foreground font-normal">(comma-separated)</span>
          </label>
          <input value={roleKeywordsInput} onChange={(e) => setRoleKeywordsInput(e.target.value)} placeholder="e.g. SDE, Backend, Frontend, Intern" title="Role Keywords" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Preferred Locations</label>
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
                className={form.preferredLocations.includes(loc) ? "btn-primary" : "btn-ghost"}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Work Mode</label>
          <div className="flex flex-wrap gap-3">
            {ALL_MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.preferredMode.includes(mode)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      preferredMode: e.target.checked ? [...f.preferredMode, mode] : f.preferredMode.filter((m) => m !== mode),
                    }))
                  }
                  className="w-4 h-4 accent-[var(--accent-coral)]"
                />
                <span className="text-sm text-foreground">{mode}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Experience Level</label>
          <select value={form.experienceLevel} onChange={(e) => setForm((f) => ({ ...f, experienceLevel: e.target.value }))} aria-label="Experience Level">
            <option value="">Any</option>
            {ALL_EXPERIENCES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Skills <span className="text-muted-foreground font-normal">(comma-separated)</span></label>
          <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g. React, Python, Java, SQL" />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Minimum Match Score: <span className="text-[var(--accent-coral)] mono-label">{form.minMatchScore}%</span>
          </label>
          <input type="range" min={0} max={100} value={form.minMatchScore} aria-label="Set minimum match score" title="Set minimum match score" onChange={(e) => setForm((f) => ({ ...f, minMatchScore: Number(e.target.value) }))} className="w-full accent-[var(--accent-coral)]" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>0%</span><span>100%</span></div>
        </div>

        <button type="button" onClick={handleSave} className="btn-primary w-full">{saved ? "✓ Preferences Saved!" : "Save Preferences"}</button>
      </div>
    </div>
  );
};

export default SettingsPage;