import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";

// Root layout (App) wraps all routes via <Outlet/>. Add further pages as children
// here when the real screens are built from the design.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [{ index: true, element: <Home /> }],
  },
]);
