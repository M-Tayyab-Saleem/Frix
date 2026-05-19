// src/utils/languageDetect.ts
// Heuristic client-side language detector for English, Urdu (Arabic script), and Roman Urdu.

/**
 * detectLanguage — heuristically identifies the language of a text prompt.
 * 
 * - If text contains any characters in the Arabic/Urdu Unicode range (U+0600 to U+06FF), returns 'urdu'.
 * - If text contains common Roman Urdu keywords (e.g. 'mujhe', 'chahiye', 'karo', 'kal', 'subah'), returns 'roman_urdu'.
 * - Default fallback is 'english'.
 */
export function detectLanguage(text: string): 'urdu' | 'roman_urdu' | 'english' {
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'urdu';
  }
  
  const romanUrduWords = [
    'mujhe', 'chahiye', 'karo', 'hai', 'mein', 'aur', 'nahi', 'nahe', 'naah',
    'kal', 'subah', 'zaroor', 'bilkul', 'kaam', 'bhai', 'raha', 'karna',
    'karnay', 'krna', 'parayshan', 'chal', 'nahi', 'nahin', 'karwana', 'kharab'
  ];
  
  const lowerText = text.toLowerCase();
  if (romanUrduWords.some(word => lowerText.includes(word))) {
    return 'roman_urdu';
  }
  
  return 'english';
}
