import { useEffect, useState } from "react";

export const useLocalStorage = function <T>(
  key: string,
  defaultValue: T
): [T, (newValue: T) => void] {
  const savedValue =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const [value, setValue] = useState(
    savedValue ? (JSON.parse(savedValue) as T) : defaultValue
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
