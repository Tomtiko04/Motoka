import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import VehicleLicenseRenewalPage from './pages/VehicleLicenseRenewalPage'
import RoadWorthinessRenewalPage from './pages/RoadWorthinessRenewalPage'
import DriversLicenseRenewalPage from './pages/DriversLicenseRenewalPage'
import InsuranceRenewalPage from './pages/InsuranceRenewalPage'
import StatePage from './pages/StatePage'
import LadipoPage from './pages/LadipoPage'
import WalletPage from './pages/WalletPage'
import MoPage from './pages/MoPage'
import BlogIndexPage from './pages/BlogIndexPage'
import BlogPostPage from './pages/BlogPostPage'
import AboutPage from './pages/AboutPage'
import FaqPage from './pages/FaqPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/renew/vehicle-license" element={<VehicleLicenseRenewalPage />} />
      <Route path="/renew/road-worthiness" element={<RoadWorthinessRenewalPage />} />
      <Route path="/renew/drivers-license" element={<DriversLicenseRenewalPage />} />
      <Route path="/renew/insurance" element={<InsuranceRenewalPage />} />
      <Route path="/states/:slug" element={<StatePage />} />
      <Route path="/ladipo" element={<LadipoPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/mo" element={<MoPage />} />
      <Route path="/blog" element={<BlogIndexPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FaqPage />} />
    </Routes>
  )
}

export default App
