import { Navigate } from "react-router-dom";
import LandingV2 from "../Landing/LandingV2.jsx";
import { authStorage } from "../utils/authStorage.js";
import { isPwaStandalone } from "../utils/pwa.js";

/**
 * `/` entry for Motoka.
 *
 * Browser visits → marketing landing.
 * Installed PWA (standalone) → feel like a real app:
 *   - logged in  → dashboard
 *   - logged out → login (not the marketing site)
 */

// The previous landing is no longer served. Its code is kept as-is in
// src/Landing/Landing.jsx and src/Landing/components/ rather than deleted.
export default function HomeEntry() {
  if (isPwaStandalone()) {
    if (authStorage.isAuthenticated()) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/auth/login" replace />;
  }

  return <LandingV2 />;
}
