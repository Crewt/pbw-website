import { createBrowserRouter, Navigate } from "react-router-dom";
import { SiteLayout } from "./site/SiteLayout";
import { HomePage } from "./site/home/HomePage";
import { UeberMichPage } from "./site/ueber-mich/UeberMichPage";
import { KursterminePage } from "./site/kurstermine/KursterminePage";
import { SeminarPage } from "./site/seminar/SeminarPage";
import { EmpfehlungenPage } from "./site/empfehlungen/EmpfehlungenPage";
import { KontaktPage } from "./site/kontakt/KontaktPage";
import { ImpressumPage } from "./site/impressum/ImpressumPage";
import { DatenschutzPage } from "./site/datenschutz/DatenschutzPage";
import { NotFoundPage } from "./site/notfound/NotFoundPage";

// The admin is code-split: visitors of the public site never download the
// editor, cropper etc. Each admin route loads its chunk on first navigation.
const adminRoot = () => import("./admin/AdminRoot").then((m) => ({ Component: m.AdminRoot }));
const coursesPanel = () => import("./admin/courses/CoursesPanel").then((m) => ({ Component: m.CoursesPanel }));
const collectionPanel = (coll: "kollegen" | "zertifikate" | "referenzen" | "ressourcen") => () =>
  import("./admin/content/CollectionPanel").then((m) => ({
    Component: () => <m.CollectionPanel coll={coll} />,
  }));
const aboutPanel = () => import("./admin/singletons/AboutPanel").then((m) => ({ Component: m.AboutPanel }));
const bilderPanel = () => import("./admin/singletons/BilderPanel").then((m) => ({ Component: m.BilderPanel }));
const kontaktPanel = () => import("./admin/singletons/KontaktPanel").then((m) => ({ Component: m.KontaktPanel }));

// Single SPA served at the domain root: the public website at /, the admin
// shell under /admin (RequireAuth gates the whole admin subtree).
export const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "ueber-mich", element: <UeberMichPage /> },
      { path: "kurstermine", element: <KursterminePage /> },
      { path: "kurstermine/:slug", element: <SeminarPage /> },
      { path: "seminar/:slug", element: <SeminarPage /> },
      { path: "kooperationen", element: <EmpfehlungenPage /> },
      { path: "empfehlungen", element: <Navigate to="/kooperationen" replace /> },
      { path: "kontakt", element: <KontaktPage /> },
      { path: "impressum", element: <ImpressumPage /> },
      { path: "datenschutz", element: <DatenschutzPage /> },
      // Counselling offers live at the top level ("/einzelberatung"); static
      // routes above rank higher, unknown slugs render SeminarPage's not-found.
      { path: ":slug", element: <SeminarPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin",
    lazy: adminRoot,
    hydrateFallbackElement: <div className="flex min-h-screen items-center justify-center text-slate">Lädt…</div>,
    children: [
      { index: true, element: <Navigate to="kurse" replace /> },
      { path: "kurse", lazy: coursesPanel },
      { path: "kollegen", lazy: collectionPanel("kollegen") },
      { path: "zertifikate", lazy: collectionPanel("zertifikate") },
      { path: "referenzen", lazy: collectionPanel("referenzen") },
      { path: "ressourcen", lazy: collectionPanel("ressourcen") },
      { path: "ueber-mich", lazy: aboutPanel },
      { path: "bilder", lazy: bilderPanel },
      { path: "kontakt", lazy: kontaktPanel },
    ],
  },
]);
