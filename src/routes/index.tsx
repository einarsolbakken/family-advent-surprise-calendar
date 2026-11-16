import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getDoors, type DoorView } from "@/lib/doors.functions";

const doorsQuery = queryOptions({ queryKey: ["doors"], queryFn: () => getDoors(), staleTime: 60_000 });

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
  loader: ({ context }) => context.queryClient.ensureQueryData(doorsQuery),
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
  const { data } = useSuspenseQuery(doorsQuery);
  const [opened, setOpened] = useState<number[]>([]);
  const [active, setActive] = useState<DoorView | null>(null);

  useEffect(() => {
    setOpened(JSON.parse(localStorage.getItem("opened-doors") ?? "[]"));
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
        <h1 className="mt-2 text-5xl font-bold sm:text-6xl">Familiens adventskalender</h1>
        <p className="mt-3 text-muted-foreground">
          {today ? `Luke ${today} er klar – trykk på pakken!` : "Første pakke kan åpnes 1. desember."}
        </p>
      </header>

      <ol className="relative grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-5 md:grid-cols-6">
        {ORDER.map((day, i) => {
          const door = byDay.get(day)!;
          const isOpen = opened.includes(day) && door.unlocked;
          const isToday = day === today && !isOpen;
          return (
            <li key={day}>
              <button
                onClick={() => open(door)}
                disabled={!door.unlocked}
                aria-label={door.unlocked ? `Åpne luke ${day}` : `Luke ${day} er låst`}
                className={`group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg transition-transform ${
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
              </button>
            </li>
          );
        })}
      </ol>

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
