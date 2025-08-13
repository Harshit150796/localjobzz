import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { LocationProvider } from './contexts/LocationContext'
import { JobProvider } from './contexts/JobContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <LocationProvider>
      <JobProvider>
        <App />
      </JobProvider>
    </LocationProvider>
  </BrowserRouter>
);
