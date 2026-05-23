import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return initial;
    }

    try {
      const parsed = JSON.parse(saved);

      // defualt config merging only plain objects
      if (
        typeof initial === "object" &&
        !Array.isArray(initial) &&
        initial !== null
      ) {
        return {
          ...initial,
          ...parsed,
        };
      }

      return parsed;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
