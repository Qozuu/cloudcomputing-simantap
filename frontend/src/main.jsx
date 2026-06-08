import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext' // 1. TAMBAHKAN IMPORT INI
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* 2. TARUH PEMBUKUS DI SINI */}
        <App />
      </AuthProvider> {/* 3. JANGAN LUPA TUTUP DI SINI */}
    </BrowserRouter>
  </React.StrictMode>,
)