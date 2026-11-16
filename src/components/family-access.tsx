import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInFamily } from "@/lib/calendar-api";

export function FamilyAccess({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
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
      <Input id="family-password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} />
      <Button disabled={busy}>{busy ? "Logger inn…" : "Åpne kalenderen"}</Button>
    </form>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
  </div>;
}