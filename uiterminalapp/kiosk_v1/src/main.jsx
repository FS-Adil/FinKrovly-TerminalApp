import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const reactElement = document.getElementById('root');

const reactRoot = createRoot(reactElement);

reactRoot.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
