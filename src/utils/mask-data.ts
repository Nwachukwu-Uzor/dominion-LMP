type Masked<T> = {
  [K in keyof T]: T[K] extends string
    ? T[K] extends `${string}${string}${string}${string}`
      ? string
      : T[K]
    : T[K] extends number
      ? T[K] extends number
        ? string
        : T[K]
      : T[K] extends object
        ? Masked<T> // Recursive case for nested objects
        : T[K];
};

export function maskValue(value: any): any {
  if (typeof value === "string") {
    const length = value.length;
    if (length > 2) {
      const maxMaskLength = Math.floor(0.6 * length);
      const startLength = Math.ceil((length - maxMaskLength) / 2);
      const endLength = length - startLength - maxMaskLength;
      const visibleStart = value.slice(0, startLength);
      const visibleEnd = value.slice(length - endLength);
      const maskedMiddle = "*".repeat(maxMaskLength);
      return `${visibleStart}${maskedMiddle}${visibleEnd}`;
    }
    return value;
  }

  if (typeof value === "number") {
    const str = value.toString();
    const length = str.length;
    if (length > 2) {
      const maxMaskLength = Math.floor(0.6 * length);
      const startLength = Math.ceil((length - maxMaskLength) / 2);
      const endLength = length - startLength - maxMaskLength;
      const visibleStart = str.slice(0, startLength);
      const visibleEnd = str.slice(length - endLength);
      const maskedMiddle = "*".repeat(maxMaskLength);
      return `${visibleStart}${maskedMiddle}${visibleEnd}`;
    }
    return str;
  }

  if (typeof value === "object" && value !== null) {
    // Handle nested objects
    return maskData(value);
  }

  return value;
}

export function maskData<T>(data: T): Masked<T> {
  const result = { ...data } as Masked<T>;

  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      // Safe property check
      result[key] = maskValue(result[key]);
    }
  }

  return result;
}
