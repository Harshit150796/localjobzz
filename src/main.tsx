import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LocationProvider } from './contexts/LocationContext'
import { JobProvider } from './contexts/JobContext'

createRoot(document.getElementById("root")!).render(
  <LocationProvider>
    <JobProvider>
      <App />
    </JobProvider>
  </LocationProvider>
);
