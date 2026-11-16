import { createServerFn } from "@tanstack/react-start";
import { unlockedDays } from "./advent";

export type DoorView = { day: number; unlocked: boolean; imageUrl: string | null; caption: string | null };

// Locked doors never leave the server with an image, so nobody can peek early.
export const getDoors = createServerFn({ method: "GET" }).handler(async (): Promise<DoorView[]> => {
  const open = unlockedDays();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows = open.length
    ? (await supabaseAdmin.from("doors").select("day,image_path,caption").in("day", open)).data ?? []
    : [];
  const signed = await Promise.all(
    rows.map(async (r) => {
      const { data } = await supabaseAdmin.storage.from("advent").createSignedUrl(r.image_path, 60 * 60 * 6);
      return { ...r, url: data?.signedUrl ?? null };
    }),
  );
  return Array.from({ length: 24 }, (_, i) => {
    const day = i + 1;
    const r = signed.find((s) => s.day === day);
    return { day, unlocked: open.includes(day), imageUrl: r?.url ?? null, caption: r?.caption ?? null };
  });
});
