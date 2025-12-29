import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore - next-themes types issue
import { ThemeProvider } from 'next-themes'
import { I18nextProvider } from 'react-i18next'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import i18n from './lib/i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* @ts-ignore - next-themes children prop type issue */}
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="ekonomi-portal-theme">
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </I18nextProvider>
    </ThemeProvider>
  </StrictMode>,
)
