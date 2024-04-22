/** wait ms */
export const sleep = async (ms = 0) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, ms));

/** try to synchronously/immutably log objects */
export const syncLog = (...args: unknown[]): void => {
  try {
    console.log(...JSON.parse(JSON.stringify(args)));
  } catch (error) {
    console.log("Couldn't log to console synchronously");
    console.log(...args);
  }
};
