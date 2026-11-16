import { supabase } from "@/integrations/supabase/client";

export type DoorView = { day: number; unlocked: boolean; imageUrl: string | null; caption: string | null };

export async function fetchCalendar(): Promise<DoorView[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Logg inn for å åpne kalenderen.");
  const origin = import.meta.env['VITE_CALENDAR_API_ORIGIN'] || "";
  const response = await fetch(`${origin}/api/public/calendar`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  if (response.status === 403) throw new Error("Du er ikke på familiens tilgangsliste ennå.");
  if (response.status === 401) throw new Error("Logg inn på nytt.");
  if (!response.ok) throw new Error("Kalenderen kunne ikke lastes. Prøv igjen senere.");
  return response.json();
}