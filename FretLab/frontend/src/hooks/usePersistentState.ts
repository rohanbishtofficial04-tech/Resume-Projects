import { useCallback, useState } from "react";
import { readJSON, writeJSON } from "@/lib/storage";

/** useState that mirrors its value into LocalStorage on every change. */
export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readJSON<T>(key, fallback));

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
        writeJSON(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}