export function allowedCalendarOrigin(origin: string | null, requestOrigin: string, configured: string | undefined) {
  return origin === null || origin === requestOrigin || origin === configured;
}

export function calendarAccessDecision(authenticated: boolean, approved: boolean) {
  return !authenticated ? 401 : !approved ? 403 : 200;
}