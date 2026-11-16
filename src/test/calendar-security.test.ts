import { describe, expect, it } from 'vitest';
import { allowedCalendarOrigin, calendarAccessDecision } from '@/lib/calendar-security';

describe('private family calendar', () => {
  it('denies signed-out visitors even if approval is claimed', () => {
    expect(calendarAccessDecision(false, true)).toBe(401);
  });
  it('denies authenticated visitors who are not approved family', () => {
    expect(calendarAccessDecision(true, false)).toBe(403);
  });
  it('allows authenticated approved family', () => {
    expect(calendarAccessDecision(true, true)).toBe(200);
  });
  it('only allows the configured Pages origin for cross-origin calls', () => {
    expect(allowedCalendarOrigin('https://einar.github.io', 'https://calendar.example', 'https://einar.github.io')).toBe(true);
    expect(allowedCalendarOrigin('https://other.github.io', 'https://calendar.example', 'https://einar.github.io')).toBe(false);
  });
});