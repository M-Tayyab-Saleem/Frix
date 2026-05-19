// src/utils/__tests__/openNowUtils.test.ts
import { getNextOpenTime, isOpenNow } from '@/utils/openNowUtils';

type Hours = Record<string, string | null>;

const ALL_DAYS: ReadonlyArray<string> = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const toDate = (year: number, monthIndex: number, day: number, hour: number, minute = 0): Date =>
  new Date(year, monthIndex, day, hour, minute, 0, 0);

const expectStatus = (label: string, actual: string, expected: string): void => {
  console.assert(actual === expected, `❌ ${label}: expected "${expected}", got "${actual}"`);
};

const expectValue = (label: string, actual: string | null, expected: string | null): void => {
  console.assert(actual === expected, `❌ ${label}: expected "${expected}", got "${actual}"`);
};

export const runOpenNowUtilsTests = (): void => {
  const fullWeekHours: Hours = {
    sunday: '10:00 AM - 08:00 PM',
    monday: '10:00 AM - 08:00 PM',
    tuesday: '10:00 AM - 08:00 PM',
    wednesday: '10:00 AM - 08:00 PM',
    thursday: '10:00 AM - 08:00 PM',
    friday: '10:00 AM - 08:00 PM',
    saturday: '10:00 AM - 08:00 PM',
  };

  // 1-7: Every day evaluates correctly during active hours.
  expectStatus('Sunday open', isOpenNow(fullWeekHours, toDate(2025, 0, 5, 12, 0)), 'open');
  expectStatus('Monday open', isOpenNow(fullWeekHours, toDate(2025, 0, 6, 12, 0)), 'open');
  expectStatus('Tuesday open', isOpenNow(fullWeekHours, toDate(2025, 0, 7, 12, 0)), 'open');
  expectStatus('Wednesday open', isOpenNow(fullWeekHours, toDate(2025, 0, 8, 12, 0)), 'open');
  expectStatus('Thursday open', isOpenNow(fullWeekHours, toDate(2025, 0, 9, 12, 0)), 'open');
  expectStatus('Friday open', isOpenNow(fullWeekHours, toDate(2025, 0, 10, 12, 0)), 'open');
  expectStatus('Saturday open', isOpenNow(fullWeekHours, toDate(2025, 0, 11, 12, 0)), 'open');

  // 8: Opening boundary inclusive.
  expectStatus(
    'Open boundary inclusive',
    isOpenNow(fullWeekHours, toDate(2025, 0, 6, 10, 0)),
    'open'
  );

  // 9: Closing boundary exclusive.
  expectStatus(
    'Close boundary exclusive',
    isOpenNow(fullWeekHours, toDate(2025, 0, 6, 20, 0)),
    'closed'
  );

  // 10: Null hours => unknown.
  expectStatus('Null hours unknown', isOpenNow(null, toDate(2025, 0, 6, 12, 0)), 'unknown');

  // 11: Overnight schedule (same-day evening segment).
  const overnightHours: Hours = {
    ...Object.fromEntries(ALL_DAYS.map((day) => [day, 'Closed'])),
    monday: '22:00-02:00',
  } as Hours;
  expectStatus(
    'Overnight open at 23:30 Monday',
    isOpenNow(overnightHours, toDate(2025, 0, 6, 23, 30)),
    'open'
  );

  // 12: Overnight carry from previous day (Tuesday 01:30 still open from Monday).
  expectStatus(
    'Overnight carry open at 01:30 Tuesday',
    isOpenNow(overnightHours, toDate(2025, 0, 7, 1, 30)),
    'open'
  );

  // 13: Day with explicit closed should be closed.
  expectStatus(
    'Explicit closed day',
    isOpenNow(overnightHours, toDate(2025, 0, 8, 12, 0)),
    'closed'
  );

  // 14: Null entry for current day should be closed (not unknown).
  const nullDayHours: Hours = {
    ...fullWeekHours,
    monday: null,
  };
  expectStatus('Current day null entry returns closed', isOpenNow(nullDayHours, toDate(2025, 0, 6, 12, 0)), 'closed');

  // 15: Invalid format for current day should be unknown.
  const invalidHours: Hours = {
    ...fullWeekHours,
    monday: 'N/A',
  };
  expectStatus('Malformed current day returns unknown', isOpenNow(invalidHours, toDate(2025, 0, 6, 12, 0)), 'unknown');

  // 16: Overnight close boundary is exclusive.
  expectStatus(
    'Overnight close boundary exclusive',
    isOpenNow(overnightHours, toDate(2025, 0, 7, 2, 0)),
    'closed'
  );

  // 17: getNextOpenTime returns same-day opening when still closed.
  expectValue(
    'Next opening same day',
    getNextOpenTime(fullWeekHours, toDate(2025, 0, 6, 9, 0)),
    'Opens Monday at 10:00 AM'
  );

  // 18: getNextOpenTime returns next-day opening when today is done.
  expectValue(
    'Next opening next day',
    getNextOpenTime(fullWeekHours, toDate(2025, 0, 6, 21, 0)),
    'Opens Tuesday at 10:00 AM'
  );

  // 19: getNextOpenTime returns null when no parsable schedules exist.
  const noScheduleHours: Hours = {
    sunday: 'Closed',
    monday: null,
    tuesday: null,
    wednesday: 'Closed',
    thursday: null,
    friday: null,
    saturday: 'Closed',
  };
  expectValue('No next opening available', getNextOpenTime(noScheduleHours, toDate(2025, 0, 6, 12, 0)), null);
};

if (__DEV__) {
  runOpenNowUtilsTests();
}
