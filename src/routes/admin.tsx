import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Fyll pakkene – adventskalender" },
      { name: "description", content: "Last opp bildene til hver luke i familiens adventskalender." },
      { property: "og:title", content: "Fyll pakkene – adventskalender" },
      { property: "og:description", content: "Last opp bildene til hver luke." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Row = { day: number; image_path: string; caption: string | null; url?: string | undefined };

function Admin() {
  const [state, setState] = useState<"loading" | "out" | "denied" | "admin">("loading");
  const [rows, setRows] = useState<Record<number, Row>>({});

  const load = async () => {
    const { data } = await supabase.from("doors").select("day,image_path,caption");
    const out: Record<number, Row> = {};
    for (const r of data ?? []) {
      const { data: s } = await supabase.storage.from("advent").createSignedUrl(r.image_path, 3600);
      out[r.day] = { ...r, url: s?.signedUrl };
    }
    setRows(out);
  };

  const check = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState("out"); return; }
    const { data: ok } = await supabase.rpc("claim_admin");
    if (!ok) { setState("denied"); return; }
    setState("admin");
    load();
  };

  useEffect(() => {
    void check();
    const { data } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") check();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const upload = async (day: number, file: File, caption: string) => {
    const path = `day-${day}-${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("advent").upload(path, file, { contentType: file.type });
    if (error) { toast.error("Kunne ikke laste opp bildet"); return; }
    const { error: e2 } = await supabase.from("doors").upsert({ day, image_path: path, caption: caption || null, updated_at: new Date().toISOString() });
    if (e2) { toast.error("Kunne ikke lagre luken"); return; }
    toast.success(`Luke ${day} er fylt!`);
    load();
  };

  const saveCaption = async (day: number, caption: string) => {
    if (!rows[day]) return;
    await supabase.from("doors").update({ caption: caption || null }).eq("day", day);
    toast.success("Tekst lagret");
  };

  if (state === "loading") return <p className="p-10 text-center">Laster…</p>;

  if (state === "out")
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-4xl font-bold">Fyll pakkene</h1>
        <p className="mt-3 text-muted-foreground">Logg inn for å legge inn bilder. Den første som logger inn blir eier av kalenderen.</p>
        <Button className="mt-6" variant="secondary" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" })}>
          Fortsett med Google
        </Button>
      </main>
    );

  if (state === "denied")
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Ingen tilgang</h1>
        <p className="mt-3 text-muted-foreground">Bare eieren av kalenderen kan fylle pakkene.</p>
        <Button className="mt-6" variant="secondary" onClick={() => supabase.auth.signOut()}>Logg ut</Button>
      </main>
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Fyll pakkene</h1>
        <Button variant="secondary" onClick={() => supabase.auth.signOut()}>Logg ut</Button>
      </div>
      <p className="mb-6 text-muted-foreground">{Object.keys(rows).length} av 24 luker har bilde.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 24 }, (_, i) => i + 1).map((day) => (
          <DoorEditor key={day} day={day} row={rows[day]} onUpload={upload} onCaption={saveCaption} />
        ))}
      </div>
    </main>
  );
}

function DoorEditor({ day, row, onUpload, onCaption }: { day: number; row?: Row | undefined; onUpload: (d: number, f: File, c: string) => void; onCaption: (d: number, c: string) => void }) {
  const [caption, setCaption] = useState(row?.caption ?? "");
  useEffect(() => { setCaption(row?.caption ?? ""); }, [row?.caption]);
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ribbon">Luke {day}</h2>
        <span className="text-xs text-muted-foreground">{row ? "Fylt" : "Tom"}</span>
      </div>
      <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-md bg-muted">
        {row?.url ? <img src={row.url} alt="" className="h-full w-full object-cover" /> : <span className="text-sm text-muted-foreground">Ingen bilde</span>}
      </div>
      <Input placeholder="Hilsen (valgfritt)" value={caption} onChange={(e) => setCaption(e.target.value)} onBlur={() => onCaption(day, caption)} className="mb-2" />
      <label className="block cursor-pointer rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:opacity-90">
        {row ? "Bytt bilde" : "Velg bilde"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(day, e.target.files[0], caption)} />
      </label>
    </div>
  );
}
