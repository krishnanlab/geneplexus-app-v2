import { http, HttpResponse, passthrough } from "msw";
import convertIds from "../fixtures/convert-ids.json";
import ml from "../fixtures/ml.json";

/** api calls to be mocked (faked) with fixture data */
export const handlers = [
  http.get("*/gpz-convert-ids", () => HttpResponse.json(convertIds)),
  http.get("*/gpz-ml", () => HttpResponse.json(ml)),

  /** any other request */
  http.get(/.*/, ({ request }) => {
    console.debug("Non-mocked request", new URL(request.url).pathname);
    return passthrough();
  }),
];
