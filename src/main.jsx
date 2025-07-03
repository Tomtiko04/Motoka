import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ReminderProvider } from './context/ReminderContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReminderProvider>
      <App />
    </ReminderProvider>
  </StrictMode>,
)
