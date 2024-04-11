import "@/global/theme.css";
import "@/global/styles.css";
import "@/global/text.css";
import "@/global/layout.css";
import "@/global/effects.css";
import { useEffect } from "react";
import { IconContext } from "react-icons";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
  useLocation,
  useMatches,
  useRouteLoaderData,
} from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FloatButtons from "@/components/FloatButtons";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TableOfContents from "@/components/TableOfContents";
import Toasts from "@/components/Toasts";
import About from "@/pages/About";
import Home from "@/pages/Home";
import LoadAnalysis from "@/pages/LoadAnalysis";
import NewAnalysis from "@/pages/NewAnalysis";
import NotFound from "@/pages/NotFound";
import Testbed from "@/pages/Testbed";
import { scrollTo } from "@/util/dom";

/** app entrypoint */
const App = () => <RouterProvider router={router} />;

export default App;

/** route layout */
const Layout = () => {
  /** current route info */
  const { hash } = useLocation();

  /** current route id */
  const id = useMatches().at(-1)?.id || "";

  /** loader data */
  const { toc } = (useRouteLoaderData(id) as Meta) || {};

  /** scroll to hash in url */
  useEffect(() => {
    if (!hash) return;
    scrollTo(hash);
  }, [hash]);

  return (
    <IconContext.Provider
      value={{ className: "icon", attr: { "aria-hidden": true } }}
    >
      <Header />
      <main>
        {toc && <TableOfContents />}
        <QueryParamProvider
          adapter={ReactRouter6Adapter}
          options={{ updateType: "replaceIn" }}
        >
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        </QueryParamProvider>
      </main>
      <Footer />
      <Toasts />
      <FloatButtons />
    </IconContext.Provider>
  );
};

/** route metadata */
type Meta = { toc?: true } | undefined;

/** route definitions */
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: async () => {
          /** handle 404 redirect */
          const url = window.sessionStorage.redirect as string;
          if (url) {
            console.debug("Redirecting to:", url);
            window.sessionStorage.removeItem("redirect");
            return redirect(url);
          } else return null;
        },
      },
      {
        path: "new-analysis",
        element: <NewAnalysis />,
      },
      {
        path: "about",
        element: <About />,
        loader: () => ({ toc: true }) satisfies Meta,
      },
      {
        path: "load-analysis",
        element: <LoadAnalysis />,
        loader: () => ({ toc: true }) satisfies Meta,
      },
      {
        path: "testbed",
        element: <Testbed />,
        loader: () => ({ toc: true }) satisfies Meta,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

/** router */
const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

/** query client */
const queryClient = new QueryClient();

/** prefix for localStorage keys */
export const storageKey = "geneplexus-";
