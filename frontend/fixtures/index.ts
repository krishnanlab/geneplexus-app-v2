import { http, passthrough } from "msw";

/** api calls to be mocked (faked) with fixture data */
export const handlers = [
  /** any other request */
  http.get(/.*/, ({ request }) => {
    console.debug("Non-mocked request", new URL(request.url).pathname);
    return passthrough();
  }),
];
