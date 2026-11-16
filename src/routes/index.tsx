import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fetchCalendar, type DoorView } from "@/lib/calendar-api";
import { FamilyAccess } from "@/components/family-access";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Shuffled, but fixed, so the calendar always looks the same.
const ORDER = [7, 18, 2, 23, 11, 5, 15, 20, 1, 9, 24, 13, 4, 17, 21, 8, 12, 3, 19, 14, 22, 6, 16, 10];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Familiens adventskalender" },
      { name: "description", content: "Åpne dagens pakke – en ny hyggelig overraskelse hver dag frem til jul." },
      { property: "og:title", content: "Familiens adventskalender" },
      { property: "og:description", content: "Åpne dagens pakke – en ny overraskelse hver dag frem til jul." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Calendar,
});

function Snow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: 30 }, (_, i) => (
        <span
          key={i}
          className="animate-snow absolute block rounded-full bg-paper opacity-60"
          style={{ left: `${(i * 37) % 100}%`, width: 3 + (i % 4), height: 3 + (i % 4), animationDuration: `${8 + (i % 7) * 2}s`, animationDelay: `-${i * 1.3}s` }}
        />
      ))}
    </div>
  );
}

function Calendar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const query = useQuery({ queryKey: ["doors", userId], queryFn: fetchCalendar, enabled: ready && !!userId, retry: false, staleTime: 30_000, refetchInterval: 120_000 });
  const data = query.data ?? [];
  const [opened, setOpened] = useState<number[]>([]);
  const [active, setActive] = useState<DoorView | null>(null);

  useEffect(() => {
    try { setOpened(JSON.parse(localStorage.getItem("opened-doors") ?? "[]")); } catch { setOpened([]); }
    void supabase.auth.getSession().then(({ data: { session } }) => { setUserId(session?.user.id ?? null); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setUserId(session?.user.id ?? null); setActive(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const open = (door: DoorView) => {
    if (!door.unlocked) return;
    const next = Array.from(new Set([...opened, door.day]));
    setOpened(next);
    localStorage.setItem("opened-doors", JSON.stringify(next));
    setActive(door);
  };

  const byDay = new Map(data.map((d) => [d.day, d]));
  const today = Math.max(0, ...data.filter((d) => d.unlocked).map((d) => d.day));

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-12">
      <Snow />
      <header className="relative mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-ribbon">Desember</p>
        <h1 className="mt-2 text-4xl font-bold sm:text-6xl">Familiens adventskalender</h1>
        {userId && <p className="mt-3 text-muted-foreground">
          {today ? `Luke ${today} er klar – trykk på pakken!` : "Første pakke kan åpnes 1. desember."}
        </p>}
      </header>

      {!ready ? <p className="text-center">Laster…</p> : !userId ? <FamilyAccess /> : query.isPending ? <p className="text-center">Laster kalenderen…</p> : query.error ? <div className="text-center"><p role="alert">{query.error.message}</p><Button className="mt-4" variant="secondary" onClick={() => query.refetch()}>Prøv igjen</Button></div> : <ol className="relative grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-5 md:grid-cols-6">
        {ORDER.map((day, i) => {
          const door = byDay.get(day);
          if (!door) return null;
          const isOpen = opened.includes(day) && door.unlocked;
          const isToday = day === today && !isOpen;
          return (
            <li key={day}>
              <Button variant="ghost"
                onClick={() => open(door)}
                disabled={!door.unlocked}
                aria-label={door.unlocked ? `Åpne luke ${day}` : `Luke ${day} er låst`}
                className={`group relative flex aspect-square h-auto w-full items-center justify-center overflow-hidden rounded-lg p-0 transition-transform ${
                  isOpen
                    ? "bg-paper"
                    : `gift ${i % 2 ? "bg-gift-a" : "bg-gift-b"} ${door.unlocked ? "hover:-translate-y-1" : "cursor-not-allowed opacity-70"}`
                } ${isToday ? "animate-wiggle shadow-[var(--glow-gold)]" : ""}`}
              >
                {isOpen && door.imageUrl ? (
                  <img src={door.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : null}
                <span
                  className={`relative z-10 font-display text-2xl font-bold sm:text-3xl ${
                    isOpen ? "rounded-md bg-paper/85 px-2 text-paper-foreground" : "rounded-full bg-background/70 px-3 py-1 text-ribbon"
                  }`}
                >
                  {day}
                </span>
              </Button>
            </li>
          );
        })}
      </ol>}

      {userId && <nav className="mt-8 flex justify-center gap-3"><Button asChild variant="link"><Link to="/admin">Fyll pakkene</Link></Button><Button variant="ghost" onClick={() => supabase.auth.signOut()}>Logg ut</Button></nav>}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg bg-paper text-paper-foreground">
          <DialogTitle className="font-display text-3xl">Luke {active?.day}</DialogTitle>
          {active?.imageUrl ? (
            <img src={active.imageUrl} alt={active.caption ?? `Bilde for luke ${active.day}`} className="w-full rounded-md" />
          ) : (
            <p className="py-8 text-center">Denne pakken er ikke fylt ennå – kom tilbake litt senere! 🎁</p>
          )}
          <DialogDescription className="text-center text-base text-paper-foreground">{active?.caption}</DialogDescription>
        </DialogContent>
      </Dialog>
    </main>
  );
}
