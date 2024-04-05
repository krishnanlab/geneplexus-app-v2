import { useCallback, useEffect, useRef, useState } from "react";

/** listen for changes to dom */
export const useMutation = (
  /** element to listen to (otherwise use returned ref) */
  element: Element | undefined,
  options: MutationObserverInit | undefined,
  callback: MutationCallback,
) => {
  const ref = useRef(null);

  useEffect(() => {
    const target = element || ref.current;
    if (!target) return;
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    return () => {
      observer.disconnect();
    };
  });

  return ref;
};

/**
 * simple version of tanstack-query with status, error handling, de-duping, and
 * caching.
 * https://github.com/monarch-initiative/monarch-app/blob/main/frontend/src/composables/use-query.ts
 */
export const useQuery = <Data>(
  func: () => Promise<Data>,
  dependencies: unknown,
  auto = true,
) => {
  /** status */
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  /** current data */
  const [data, setData] = useState<Data>();

  /** cache key */
  const key = JSON.stringify(dependencies);

  /** cache store for this query */
  const cache = useRef(new Map<typeof dependencies, Data>());

  /** keep track of latest query function run */
  const latest = useRef(Symbol());

  /** query function */
  const query = useCallback(async () => {
    try {
      /** unique id for current query function run */
      const current = Symbol();
      latest.current = current;

      /** reset state */
      setStatus("loading");
      setData(undefined);

      /** check if data already cached */
      const cached = cache.current.get(key);

      /** use cached data or run provided function to get data */
      const result = (await cached) ?? (await func());

      /** set cache */
      if (!cached) cache.current.set(key, result);

      /** if this query function run is still the latest */
      if (current === latest.current) {
        setData(result);
        setStatus("success");
      } else {
        console.debug("Stale query");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [func, key]);

  /** re-run query function automatically */
  useEffect(() => {
    if (auto) query();
  }, [auto, query, key]);

  return { query, data, status };
};
