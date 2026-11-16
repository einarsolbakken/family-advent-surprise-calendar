// Hosted previews call their own current server; only the static Pages build
// needs the separately published calendar server.
export function calendarEndpointOrigin(development: boolean, configuredOrigin: string | undefined) {
  return development ? "" : (configuredOrigin ?? "").replace(/\/$/, "");
}

export async function requestCalendar(url: string, init: RequestInit) {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error("Får ikke kontakt med kalenderen. Prøv igjen om litt.");
  }
}