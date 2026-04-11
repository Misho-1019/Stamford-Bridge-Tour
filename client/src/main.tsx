// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.tsx'
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.tsx";
import { ClientAuthProvider } from "./context/ClientAuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <ClientAuthProvider>
    <AdminAuthProvider>
      <RouterProvider router={router} />
    </AdminAuthProvider>,
  </ClientAuthProvider>,
  // </StrictMode>,
);
