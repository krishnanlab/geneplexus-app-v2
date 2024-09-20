import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.debug({ env: import.meta.env });

(async () => {
  /** mock api */
  if (
    new URL(
      window.sessionStorage.redirect || window.location.href,
    ).searchParams.get("mock") === "true"
  ) {
    const { setupWorker } = await import("msw/browser");
    const { handlers } = await import("../fixtures");
    await setupWorker(...handlers).start({
      serviceWorker: { url: import.meta.env.BASE_URL + "mockServiceWorker.js" },
    });
  }

  /** render app entrypoint */
  createRoot(document.getElementById("app")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
})();
