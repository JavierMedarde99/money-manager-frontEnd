import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAuthStore } from './store/auth'
import { UNAUTHORIZED_EVENT } from './lib/authEvents'

// React to an expired/invalid bearer token (401) without a full page reload:
// log out (ProtectedRoute then redirects to /login) and flag the session as
// expired so the Login page can explain what happened. Registered once, before
// the app renders, so no response can slip through.
window.addEventListener(UNAUTHORIZED_EVENT, () => {
  const { logout, setSessionExpired } = useAuthStore.getState()
  logout()
  setSessionExpired(true)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
