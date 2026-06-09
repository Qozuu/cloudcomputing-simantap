import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Hapus <BrowserRouter> dari sini karena di dalam App.jsx 
      sudah menggunakan RouterProvider bawaan React Router v6 modern.
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)