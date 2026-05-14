import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#14141f', color: '#e8e8f0', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'DM Sans' },
          success: { iconTheme: { primary: '#ff1a4d', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
