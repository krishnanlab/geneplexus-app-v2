import { useCallback, useRef, useState } from "react";
import { sleep } from "@/util/misc";

/**
 * simple version of tanstack-query with status, error handling, de-duping, and
 * caching.
 * https://github.com/monarch-initiative/monarch-app/blob/main/frontend/src/composables/use-query.ts
 */
export const useQuery = <Data>(
  func: () => Promise<Data>,
  dependencies: unknown,
) => {
  /** unique key based on dependencies */
  const key = JSON.stringify(dependencies);

  const [state, setState] = useState<{
    /** current status */
    status: "empty" | "loading" | "error" | "success";
    /** current data */
    data?: Data;
    /** dependencies corresponding with current data */
    key?: string;
  }>({ status: "empty" });

  /** keep track of latest query function run */
  const latest = useRef(Symbol());

  const query = useCallback(async () => {
    try {
      /** unique id for current query function run */
      const current = Symbol();
      latest.current = current;

      /**
       * account for rapid successive queries (e.g. react strict mode double
       * render)
       */
      await sleep(10);
      if (current !== latest.current) return console.debug("Rapid query");

      setState({ status: "loading" });

      /** use cached data or run provided function to get data */
      const result = await func();

      /** if this query function run is still the latest */
      if (current === latest.current)
        setState({ status: "success", data: result, key });
      else console.debug("Stale query");
    } catch (error) {
      console.error(error);
      setState({ status: "error" });
    }
  }, [func, key]);

  const reset = useCallback(() => {
    setState({ status: "empty" });
  }, []);

  /**
   * if current dependencies don't match those which determined current data,
   * reset
   */
  if (state.key && key !== state.key) reset();

  return {
    /**
     * query function. only run inside useEffect:
     * https://react.dev/reference/react/useRef#caveats
     */
    query,
    /** reset data and status */
    reset,
    /** current status */
    status: state.status,
    /** current data */
    data: state.data,
  };
};
