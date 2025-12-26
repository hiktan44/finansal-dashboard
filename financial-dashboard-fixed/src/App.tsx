import FinancialDashboard from './components/FinancialDashboard'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <div className="min-h-screen bg-gray-900">
          <FinancialDashboard />
        </div>
      </UserPreferencesProvider>
    </AuthProvider>
  )
}

export default App
