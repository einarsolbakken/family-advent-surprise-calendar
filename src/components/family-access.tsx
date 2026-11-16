import { useState } from "react";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";

export function FamilyAccess() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const login = async (provider: "google" | "lovable") => {
    setBusy(true);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}${import.meta.env.BASE_URL}` });
      if (result.error) setError("Kunne ikke logge inn. Prøv igjen.");
    } catch { setError("Kunne ikke logge inn. Prøv igjen."); }
    finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-sm py-8 text-center">
    <p className="mb-5 text-muted-foreground">Logg inn for å åpne familiens kalender.</p>
    <div className="flex flex-col gap-3">
      <Button variant="secondary" disabled={busy} onClick={() => login("google")}>Fortsett med Google</Button>
      <Button variant="outline" disabled={busy} onClick={() => login("lovable")}>Fortsett med Lovable</Button>
    </div>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
  </div>;
}