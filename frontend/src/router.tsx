import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./admin/auth/RequireAuth";
import { AdminLayout } from "./admin/AdminLayout";
import { CoursesPanel } from "./admin/courses/CoursesPanel";
import { CollectionPanel } from "./admin/content/CollectionPanel";
import { KontaktPanel } from "./admin/singletons/KontaktPanel";
import { AboutPanel } from "./admin/singletons/AboutPanel";
import { BilderPanel } from "./admin/singletons/BilderPanel";
import { SiteLayout } from "./site/SiteLayout";
import { HomePage } from "./site/home/HomePage";
import { UeberMichPage } from "./site/ueber-mich/UeberMichPage";
import { KursterminePage } from "./site/kurstermine/KursterminePage";
import { SeminarPage } from "./site/seminar/SeminarPage";
import { EmpfehlungenPage } from "./site/empfehlungen/EmpfehlungenPage";
import { KontaktPage } from "./site/kontakt/KontaktPage";
import { ImpressumPage } from "./site/impressum/ImpressumPage";
import { DatenschutzPage } from "./site/datenschutz/DatenschutzPage";

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
      { path: "seminar/:slug", element: <SeminarPage /> },
      { path: "empfehlungen", element: <EmpfehlungenPage /> },
      { path: "kontakt", element: <KontaktPage /> },
      { path: "impressum", element: <ImpressumPage /> },
      { path: "datenschutz", element: <DatenschutzPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="kurse" replace /> },
      { path: "kurse", element: <CoursesPanel /> },
      { path: "kollegen", element: <CollectionPanel coll="kollegen" /> },
      { path: "zertifikate", element: <CollectionPanel coll="zertifikate" /> },
      { path: "referenzen", element: <CollectionPanel coll="referenzen" /> },
      { path: "ressourcen", element: <CollectionPanel coll="ressourcen" /> },
      { path: "ueber-mich", element: <AboutPanel /> },
      { path: "bilder", element: <BilderPanel /> },
      { path: "kontakt", element: <KontaktPanel /> },
    ],
  },
]);
