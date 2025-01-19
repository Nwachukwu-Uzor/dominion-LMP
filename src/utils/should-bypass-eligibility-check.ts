const ALLOW_PREFIXES_FOR_IPPIS_BY_PASS = ["NCS", "TI"];

export const shouldAllowEligibilityByPass = (ippisNumber: string): boolean => {
  // Convert ippisNumber to lowercase for case-insensitive comparison
  const lowerCaseIppisNumber = ippisNumber?.trim()?.toLowerCase();
  if (!lowerCaseIppisNumber || !(lowerCaseIppisNumber?.length > 0)) {
    return false;
  }

  // Check if the ippisNumber starts with any of the allowed prefixes (case-insensitive)
  const hasAllowedPrefix = ALLOW_PREFIXES_FOR_IPPIS_BY_PASS.some((prefix) =>
    lowerCaseIppisNumber.startsWith(prefix.toLowerCase()),
  );
  // Check if the ippisNumber starts with a number
  const startsWithNumber = /^\d/.test(ippisNumber);

  // Return true if either condition is met
  return hasAllowedPrefix || startsWithNumber;
};
