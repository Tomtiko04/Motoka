import { Navigate } from "react-router-dom";
import LandingPage from "../Landing/Landing.jsx";
import { authStorage } from "../utils/authStorage.js";
import { isPwaStandalone } from "../utils/pwa.js";

/**
 * `/` entry for Motoka.
 *
 * Browser visits → marketing landing (unchanged).
 * Installed PWA (standalone) → feel like a real app:
 *   - logged in  → dashboard
 *   - logged out → login (not the marketing site)
 */
export default function HomeEntry() {
  if (isPwaStandalone()) {
    if (authStorage.isAuthenticated()) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/auth/login" replace />;
  }

  return <LandingPage />;
}
