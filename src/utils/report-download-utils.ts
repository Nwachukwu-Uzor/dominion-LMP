export const formatDataForReport = (
    arrayOfObjects: Record<string, unknown>[],
    excludeKeys: string[] = [],
    keyMappings: Record<string, string> = {}
  ) => {
    return arrayOfObjects.map((obj) => {
      const transformedObj: Record<string, unknown> = {};
  
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (excludeKeys.includes(key)) {
            // Skip the key if it's in the excludeKeys array
            continue;
          } else if (key in keyMappings) {
            // Use the mapped key if present in keyMappings
            transformedObj[keyMappings[key]] = obj[key];
          } else {
            // Transform camelCase to Capitalized Words
            const transformedKey = key
              .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
              .replace(/^./, (str) => str.toUpperCase());
            transformedObj[transformedKey] = obj[key];
          }
        }
      }
  
      return transformedObj;
    });
  };
  