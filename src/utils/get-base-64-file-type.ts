export function getBase64FileType(base64String: string): string | null {
  const mimeMatch = base64String.match(/^data:(.*?);base64,/);
  if (mimeMatch && mimeMatch.length > 1) {
    return mimeMatch[1];
  }
  return null;
}
