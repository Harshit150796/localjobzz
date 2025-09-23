import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { LocationProvider } from './contexts/LocationContext'
import { JobProvider } from './contexts/JobContext'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <LocationProvider>
        <JobProvider>
          <App />
        </JobProvider>
      </LocationProvider>
    </AuthProvider>
  </BrowserRouter>
);
