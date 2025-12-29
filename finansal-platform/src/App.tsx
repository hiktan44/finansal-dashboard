import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { EconomicReports } from './pages/EconomicReports';
import { CurrentAnalysis } from './pages/CurrentAnalysis';
import { MacroEconomic } from './pages/MacroEconomic';
import { AssetDetail } from './pages/AssetDetail';
import { AlertsPanel } from './components/AlertsPanel';
import { GlobalFAB } from './components/ui/GlobalFAB';
import './lib/i18n';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          
          <main>
            <Routes>
              {/* Ana sayfa - Economic Reports'a yönlendir */}
              <Route path="/" element={<Navigate to="/reports" replace />} />
              <Route path="/reports" element={<EconomicReports />} />
              <Route path="/analysis" element={<CurrentAnalysis />} />
              <Route path="/macro" element={<MacroEconomic />} />
              <Route path="/alerts" element={<AlertsPanel />} />
              <Route path="/assets/:symbol" element={<AssetDetail />} />
            </Routes>
          </main>

          {/* Global FAB - Tüm sayfalarda paylaşım butonu */}
          <GlobalFAB />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
