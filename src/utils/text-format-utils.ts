export function capitalize(word: string) {
  if (!word) return word; // Check for empty string or null/undefined
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
