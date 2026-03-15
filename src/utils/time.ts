import { DateTime } from 'luxon';
const parseAmPmToDate = (timeStr: string | Date, baseDate?: Date): Date => {
  if (timeStr instanceof Date) {
    return timeStr;
  }

  if (typeof timeStr !== 'string') {
    throw new Error(`Invalid time input: expected string, got ${typeof timeStr}`);
  }

  const timezone = 'Asia/Dhaka';

  const timeMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!timeMatch) {
    throw new Error(`Invalid time format: ${timeStr}. Expected format: HH:MM AM/PM`);
  }

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const period = timeMatch[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const base = baseDate
    ? DateTime.fromJSDate(baseDate, { zone: timezone })
    : DateTime.now().setZone(timezone);

  const result = base.set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0,
  });
  return result.toJSDate();
};

export const getBangladeshTime = (): Date => {
  return DateTime.now().setZone('Asia/Dhaka').toJSDate();
};
export const toBangladeshTime = (date: Date | string): Date => {
  return DateTime.fromJSDate(new Date(date)).setZone('Asia/Dhaka').toJSDate();
};

export const parseDateInBD = (dateStr: string | Date): Date => {
  if (dateStr instanceof Date) {
    return dateStr;
  }
  if (typeof dateStr !== 'string') {
    throw new Error(`Invalid date input: expected string, got ${typeof dateStr}`);
  }

  return DateTime.fromISO(dateStr, { zone: 'Asia/Dhaka' }).toJSDate();
};

export default parseAmPmToDate;
