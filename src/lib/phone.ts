export function normalizePhone(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, "");
  const phone = /^\d{8}$/.test(compact) ? `+47${compact}` : compact.replace(/^00/, "+");
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}