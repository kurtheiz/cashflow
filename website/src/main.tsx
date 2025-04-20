import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Import router configuration to suppress warnings
import './routerConfig.js'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
