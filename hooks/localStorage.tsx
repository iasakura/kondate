import { useEffect, useState } from "react";

export const useLocalStorage = function <T>(
  key: string,
  defaultValue: string | undefined
): [string, (newValue: string) => void] {
  const savedValue =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const [value, setValue] = useState(defaultValue ?? savedValue ?? "");

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return [value, setValue];
};
