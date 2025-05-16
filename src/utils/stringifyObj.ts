export const stringifyObj = (data: Record<string, unknown>): string => {
  const clone = structuredClone(data);

  const recursiveStringify = (obj: Record<string, unknown>): void => {
    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'object' && value !== null) {
        recursiveStringify(value as Record<string, unknown>);
        obj[key] = JSON.stringify(value);
      }
    }
  };

  recursiveStringify(clone);
  return JSON.stringify(clone);
};
