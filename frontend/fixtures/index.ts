import {
  http,
  HttpResponse,
  passthrough,
  type HttpResponseResolver,
} from "msw";
import convertIds from "../fixtures/convert-ids.json";
import ml from "../fixtures/ml.json";

const nonMocked: HttpResponseResolver = ({ request }) => {
  console.debug("Non-mocked request", new URL(request.url).pathname);
  return passthrough();
};

/** api calls to be mocked (faked) with fixture data */
export const handlers = [
  http.post("*/gpz-convert-ids", () => HttpResponse.json(convertIds)),
  http.post("*/gpz-ml", () => HttpResponse.json(ml)),

  /** any other request */
  http.get(/.*/, nonMocked),
  http.post(/.*/, nonMocked),
];
