import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus } from "lucide-react";

export function FamilyMembers() {
  const [members, setMembers] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const { data, error } = await supabase.from("calendar_members").select("email").order("email");
    if (error) setError("Kunne ikke hente familielisten.");
    else setMembers((data ?? []).map((r) => r.email));
  };
  useEffect(() => { void load(); }, []);
  return <section className="mb-10 border-b pb-8">
    <h2 className="mb-4 text-2xl font-bold">Familietilgang</h2>
    <form className="flex flex-wrap gap-2" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setError("");
      const { error } = await supabase.from("calendar_members").insert({ email: email.trim().toLowerCase() });
      if (error) setError("Kunne ikke legge til adressen. Er den allerede på listen?");
      else { setEmail(""); await load(); }
      setBusy(false);
    }}>
      <Input aria-label="Familiemedlemmets e-postadresse" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-postadresse" className="min-w-0 flex-1" />
      <Button disabled={busy}><UserPlus />Legg til</Button>
    </form>
    {error && <p role="alert" className="mt-3 text-destructive">{error}</p>}
    <ul className="mt-4 divide-y">
      {members.map((member) => <li key={member} className="flex items-center justify-between gap-3 py-2">
        <span className="min-w-0 break-all">{member}</span>
        <Button size="icon" variant="ghost" aria-label={`Fjern ${member}`} title="Fjern tilgang" onClick={async () => {
          if (!window.confirm(`Fjerne tilgang for ${member}?`)) return;
          const { error } = await supabase.from("calendar_members").delete().eq("email", member);
          if (error) setError("Kunne ikke fjerne tilgangen."); else await load();
        }}><Trash2 /></Button>
      </li>)}
    </ul>
  </section>;
}