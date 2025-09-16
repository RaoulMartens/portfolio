import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'foundation-sites/dist/css/foundation.min.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
