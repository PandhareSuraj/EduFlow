import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { addMinutes, differenceInMinutes, isAfter, isBefore, parseISO } from 'date-fns';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current time in IST timezone
 */
export const getCurrentISTTime = (): Date => {
  return toZonedTime(new Date(), IST_TIMEZONE);
};

/**
 * Convert any date to IST timezone
 */
export const convertToIST = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, IST_TIMEZONE);
};

/**
 * Format dates in IST timezone
 */
export const formatISTDate = (date: Date | string, formatStr = 'yyyy-MM-dd HH:mm:ss'): string => {
  return format(convertToIST(date), formatStr, { timeZone: IST_TIMEZONE });
};

/**
 * Compare dates in IST context
 */
export const compareWithIST = (date1: Date | string, date2: Date | string): number => {
  const istDate1 = convertToIST(date1);
  const istDate2 = convertToIST(date2);
  return istDate1.getTime() - istDate2.getTime();
};

/**
 * Parse date string and convert to IST
 */
export const parseISTDate = (dateString: string): Date => {
  return convertToIST(parseISO(dateString));
};

/**
 * Check if current IST time is after given date
 */
export const isCurrentISTAfter = (date: Date | string): boolean => {
  const now = getCurrentISTTime();
  const targetDate = convertToIST(date);
  return isAfter(now, targetDate);
};

/**
 * Check if current IST time is before given date
 */
export const isCurrentISTBefore = (date: Date | string): boolean => {
  const now = getCurrentISTTime();
  const targetDate = convertToIST(date);
  return isBefore(now, targetDate);
};

/**
 * Check if current IST time is between two dates
 */
export const isCurrentISTBetween = (startDate: Date | string, endDate: Date | string): boolean => {
  const now = getCurrentISTTime();
  const start = convertToIST(startDate);
  const end = convertToIST(endDate);
  return isAfter(now, start) && isBefore(now, end);
};

/**
 * Get time remaining in minutes from current IST time to target date
 */
export const getMinutesRemainingIST = (targetDate: Date | string): number => {
  const now = getCurrentISTTime();
  const target = convertToIST(targetDate);
  return differenceInMinutes(target, now);
};

/**
 * Convert UTC date to IST for storage (returns UTC date that represents IST time)
 */
export const convertISTToUTC = (istDate: Date): Date => {
  return fromZonedTime(istDate, IST_TIMEZONE);
};

/**
 * Convert form time input (assumed IST) to UTC ISO string for database storage
 * This is critical for exam scheduling where admin inputs time in IST
 */
export const convertFormTimeToUTC = (date: string, time: string): string => {
  // Create a date string in IST format
  const istDateTimeString = `${date}T${time}:00`;
  // Parse as IST and convert to UTC
  const utcDate = fromZonedTime(istDateTimeString, IST_TIMEZONE);
  return utcDate.toISOString();
};

/**
 * Format time duration in human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 0) return 'Expired';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Get exam status based on IST timing
 */
export const getExamStatus = (
  startTime: string | Date, 
  endTime: string | Date,
  isCompleted = false
): 'available' | 'completed' | 'upcoming' | 'expired' => {
  if (isCompleted) return 'completed';
  
  const now = getCurrentISTTime();
  const start = convertToIST(startTime);
  const end = convertToIST(endTime);
  
  if (isAfter(now, end)) return 'expired';
  if (isAfter(now, start) && isBefore(now, end)) return 'available';
  return 'upcoming';
};