import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import SellerDashboard from './pages/Seller/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import SellersManager from './pages/Admin/Sellers';
import SalesManager from './pages/Sales/SalesList';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#718096] font-medium animate-pulse">Carregando Ora...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const renderContent = () => {
    if (profile.role === 'admin') {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />;
        case 'sellers': return <SellersManager />;
        case 'sales': return <SalesManager />;
        default: return <AdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <SellerDashboard />;
        case 'history': return <SalesManager />;
        case 'ranking': return <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-gray-100 text-center text-gray-400 font-medium">O Ranking é atualizado semanalmente.</div>;
        case 'commissions': return <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-gray-100 text-center text-gray-400 font-medium">Área financeira em manutenção para balanço mensal.</div>;
        default: return <SellerDashboard />;
      }
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
