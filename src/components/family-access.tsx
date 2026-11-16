import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInFamily } from "@/lib/calendar-api";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export function FamilyAccess({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const signIn = async () => {
    setBusy(true);
    setError("");
    try {
      await signInFamily(password);
      setPassword("");
      onSignedIn();
    } catch (error) { setError(error instanceof Error ? error.message : "Kunne ikke logge inn."); }
    finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-sm py-8 text-center">
    <form className="flex flex-col gap-3 text-left" onSubmit={(event) => { event.preventDefault(); void signIn(); }}>
      <label htmlFor="family-password" className="text-center">Familiepassord</label>
      <div className="relative">
        <LockKeyhole aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ribbon" />
        <Input id="family-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required maxLength={256} placeholder="Skriv familiepassordet" className="h-14 rounded-lg border-ribbon/40 bg-card/80 pl-12 pr-14 text-base focus-visible:border-ribbon focus-visible:ring-2 focus-visible:ring-ring/40" value={password} onChange={(event) => setPassword(event.target.value)} />
        <Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Skjul passord" : "Vis passord"} title={showPassword ? "Skjul passord" : "Vis passord"} aria-pressed={showPassword} className="absolute right-2 top-1/2 size-10 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(current => !current)}>
          {showPassword ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      <Button disabled={busy}>{busy ? "Logger inn…" : "Åpne kalenderen"}</Button>
    </form>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
  </div>;
}