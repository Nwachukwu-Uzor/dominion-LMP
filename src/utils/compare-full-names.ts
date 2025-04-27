// export function compareFullNames(
//   fullNameFromIppis: string,
//   fullNameFromBvn: string,
// ): boolean {
//   console.log({ fullNameFromIppis, fullNameFromBvn });

//   const normalize = (name: string) => {
//     return name
//       .toLowerCase()
//       .split(/[ ,]+/) // Split by spaces or commas
//       .filter((n) => n.trim() !== "") // Remove empty strings
//       .sort() // Sort to ensure order doesn't matter
//       .join(" ");
//   };

//   const normalizedNamesFromIppis = normalize(fullNameFromIppis)
//     .split(" ")
//     .filter((name) => name.length > 0)
//     .map((name) => name.toLowerCase());
//   const normalizedNamesFromBvn = normalize(fullNameFromBvn)
//     .split(" ")
//     .filter((name) => name.trim().length > 0)
//     .map((name) => name.toLowerCase());
//   return normalizedNamesFromIppis.every((name) =>
//     normalizedNamesFromBvn.includes(name),
//   );
// }

export function compareFullNames(
  fullNameFromIppis: string,
  fullNameFromBvn: string,
) {
  const normalizedFullNameFromIppisArray = fullNameFromIppis
    ?.split(" ")
    ?.map((name) => name.toLocaleUpperCase());
  const normalizedFullNameFromBvnArray = fullNameFromBvn
    ?.split(" ")
    ?.map((name) => name.toLocaleUpperCase());

  return normalizedFullNameFromBvnArray.some((name) =>
    normalizedFullNameFromIppisArray.includes(name),
  );
}
