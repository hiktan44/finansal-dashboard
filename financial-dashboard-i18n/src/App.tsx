import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, TrendingUp, AlertTriangle, BarChart3, User, Menu, X, Globe } from 'lucide-react';
import './lib/i18n';
import { supportedLanguages } from './lib/i18n';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  change: number;
}

interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  type: 'above' | 'below';
  active: boolean;
}

function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('home');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Mock data
  const [portfolio] = useState<Stock[]>([
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 10,
      purchasePrice: 150,
      currentPrice: 175,
      change: 16.67
    },
    {
      id: '2', 
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 5,
      purchasePrice: 2800,
      currentPrice: 2950,
      change: 5.36
    }
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      symbol: 'AAPL',
      targetPrice: 180,
      type: 'above',
      active: true
    }
  ]);

  const totalValue = portfolio.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
  const totalGainLoss = portfolio.reduce((sum, stock) => {
    const gainLoss = (stock.currentPrice - stock.purchasePrice) * stock.quantity;
    return sum + gainLoss;
  }, 0);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setShowLanguageMenu(false);
  };

  const getLanguageDisplayName = (code: string) => {
    return supportedLanguages[code as keyof typeof supportedLanguages] || code;
  };

  const renderHome = () => (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="mr-2" />
          {t('home.marketStatus')}
        </h2>
        <p className="text-gray-300 text-sm">
          {t('home.lastUpdate', { date: new Date().toLocaleDateString() })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-center space-x-2 transition-colors">
          <AlertTriangle size={20} />
          <span>{t('home.priceAlert')}</span>
        </button>
        <button 
          onClick={() => setActiveTab('portfolio')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
        >
          <BarChart3 size={20} />
          <span>{t('home.myPortfolio')}</span>
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl flex items-center justify-center space-x-2 transition-colors">
          <BarChart3 size={20} />
          <span>{t('home.aiAnalysis')}</span>
        </button>
        <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl flex items-center justify-center space-x-2 transition-colors">
          <TrendingUp size={20} />
          <span>{t('home.news')}</span>
        </button>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{t('portfolio.title')}</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            {t('portfolio.addStock')}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">{t('portfolio.totalValue')}</p>
            <p className="text-white text-xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">{t('portfolio.gainLoss')}</p>
            <p className={`text-xl font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalGainLoss.toLocaleString()}
            </p>
          </div>
        </div>

        {portfolio.length === 0 ? (
          <p className="text-gray-400 text-center py-8">{t('portfolio.empty')}</p>
        ) : (
          <div className="space-y-3">
            {portfolio.map((stock) => (
              <div key={stock.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">{stock.symbol}</h3>
                    <p className="text-gray-400 text-sm">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">${stock.currentPrice}</p>
                    <p className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{t('alerts.title')}</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            {t('alerts.createAlert')}
          </button>
        </div>

        {alerts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">{t('alerts.noAlerts')}</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">{alert.symbol}</h3>
                    <p className="text-gray-400 text-sm">
                      ${alert.targetPrice} {alert.type === 'above' ? '↑' : '↓'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${alert.active ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                      {alert.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-6 space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">{t('profile.title')}</h2>
        
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Globe size={20} />
                <span>{t('profile.language')}</span>
              </div>
              <ChevronDown size={20} />
            </button>
            
            {showLanguageMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-lg shadow-lg z-10">
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    className={`w-full text-left p-3 hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                      i18n.language === code ? 'bg-blue-600' : 'text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center space-x-3">
            <User size={20} />
            <span>{t('profile.settings')}</span>
          </button>

          <button className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg">
            {t('profile.signOut')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'portfolio':
        return renderPortfolio();
      case 'alerts':
        return renderAlerts();
      case 'profile':
        return renderProfile();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('home.title')}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {getLanguageDisplayName(i18n.language)}
            </span>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`bg-gray-800 w-64 min-h-screen ${isMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4 space-y-2">
            <button
              onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <TrendingUp size={20} />
              <span>{t('nav.home')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('portfolio'); setIsMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === 'portfolio' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BarChart3 size={20} />
              <span>{t('nav.portfolio')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('alerts'); setIsMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <AlertTriangle size={20} />
              <span>{t('nav.alerts')}</span>
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
              className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
                activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <User size={20} />
              <span>{t('nav.profile')}</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>

      {/* Click outside to close language menu */}
      {showLanguageMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowLanguageMenu(false)}
        />
      )}
    </div>
  );
}

export default App;