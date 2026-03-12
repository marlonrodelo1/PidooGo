import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

const isNative = Capacitor.isNativePlatform?.() ?? false

if (isNative) {
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {})

  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('native-app')
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className={isNative ? 'safe-area-container' : ''}>
          <App />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
