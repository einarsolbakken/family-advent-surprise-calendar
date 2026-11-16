import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizePhone } from "@/lib/phone";

export function FamilyAccess() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [sentPhone, setSentPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const sendCode = async () => {
    const normalized = normalizePhone(phone);
    if (!normalized) { setError("Skriv et gyldig telefonnummer med landskode."); return; }
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: normalized, options: { channel: "sms" } });
      if (error) setError("Kunne ikke sende SMS. Prøv igjen senere, eller kontakt eieren av kalenderen.");
      else { setSentPhone(normalized); setCode(""); }
    } catch { setError("Kunne ikke sende SMS. Prøv igjen senere."); }
    finally { setBusy(false); }
  };
  const verifyCode = async () => {
    if (!sentPhone) return;
    setBusy(true); setError("");
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: sentPhone, token: code.trim(), type: "sms" });
      if (error) setError("Koden er feil eller har utløpt. Prøv igjen eller be om en ny kode.");
    } catch { setError("Kunne ikke logge inn. Prøv igjen."); }
    finally { setBusy(false); }
  };
  return <div className="mx-auto max-w-sm py-8 text-center">
    <p className="mb-5 text-muted-foreground">Logg inn for å åpne familiens kalender.</p>
    <form className="flex flex-col gap-3 text-left" onSubmit={(event) => { event.preventDefault(); void (sentPhone ? verifyCode() : sendCode()); }}>
      {sentPhone ? <>
        <p className="text-center text-sm text-muted-foreground">SMS-kode sendt til {sentPhone}</p>
        <label htmlFor="sms-code">SMS-kode</label>
        <Input id="sms-code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{4,8}" maxLength={8} required value={code} onChange={(event) => setCode(event.target.value)} />
        <Button disabled={busy}>{busy ? "Sjekker…" : "Logg inn"}</Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => void sendCode()}>Send ny kode</Button>
        <Button type="button" variant="link" disabled={busy} onClick={() => { setSentPhone(null); setError(""); setCode(""); }}>Bytt telefonnummer</Button>
      </> : <>
        <label htmlFor="family-phone">Telefonnummer</label>
        <Input id="family-phone" type="tel" autoComplete="tel" required maxLength={25} placeholder="+47 123 45 678" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Button disabled={busy}>{busy ? "Sender…" : "Send SMS-kode"}</Button>
      </>}
    </form>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
  </div>;
}