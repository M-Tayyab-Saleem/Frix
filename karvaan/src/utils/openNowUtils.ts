// src/utils/openNowUtils.ts
// Utility function to check if a venue is currently open

export function isOpenNow(hours: Record<string, string> | null): 'open' | 'closed' | 'unknown' {
  if (!hours) return 'unknown';
  
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hoursForDay = hours[day];
  
  if (!hoursForDay) return 'unknown';
  
  try {
    // Parse time range, e.g., "9:00 AM - 6:00 PM"
    const [startStr, endStr] = hoursForDay.split(' - ').map((s) => s.trim());
    
    const startTime = parseTime(startStr);
    const endTime = parseTime(endStr);
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    if (startTime <= currentTime && currentTime < endTime) {
      return 'open';
    }
    return 'closed';
  } catch {
    return 'unknown';
  }
}

function parseTime(timeStr: string): number {
  // e.g., "9:00 AM" → 9 * 60 + 0 = 540
  // e.g., "6:00 PM" → 18 * 60 + 0 = 1080
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map((s) => parseInt(s, 10));
  
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}
