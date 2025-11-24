import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '../index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'glass-card border-cyan-500/20',
              title: 'text-foreground',
              description: 'text-muted-foreground',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
