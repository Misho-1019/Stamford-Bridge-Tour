// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RouterProvider } from 'react-router'
import { router } from './router.tsx'
import { AdminAuthProvider } from './context/AdminAuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <AdminAuthProvider>
    <RouterProvider router={router} />
  </AdminAuthProvider>
  // </StrictMode>,
)
