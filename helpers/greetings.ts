export const getGreeting = (date: Date = new Date()): string => {
  const hour = date.getHours();

  // Early morning: 12:00 AM - 5:59 AM
  if (hour >= 0 && hour < 6) {
    return "Good early morning";
  }

  // Morning: 6:00 AM - 11:59 AM
  if (hour >= 6 && hour < 12) {
    return "Good morning";
  }

  // Noon: 12:00 PM - 12:59 PM
  if (hour === 12) {
    return "Good noon";
  }

  // Afternoon: 1:00 PM - 4:59 PM
  if (hour >= 13 && hour < 17) {
    return "Good afternoon";
  }

  // Evening: 5:00 PM - 7:59 PM
  if (hour >= 17 && hour < 20) {
    return "Good evening";
  }

  // Night: 8:00 PM - 11:59 PM
  if (hour >= 20 && hour <= 23) {
    return "Good night";
  }

  // Fallback
  return "Hello";
};


