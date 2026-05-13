import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Trophy,
  History,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = profile?.role === 'admin' ? [
    { icon: LayoutDashboard, label: 'Geral', id: 'dashboard' },
    { icon: Users, label: 'Vendedores', id: 'sellers' },
    { icon: FileText, label: 'Contratos', id: 'sales' },
    { icon: BarChart3, label: 'Relatórios', id: 'reports' },
    { icon: Settings, label: 'Sistema', id: 'settings' },
  ] : [
    { icon: LayoutDashboard, label: 'Meu Painel', id: 'dashboard' },
    { icon: History, label: 'Minhas Vendas', id: 'history' },
    { icon: Trophy, label: 'Ranking', id: 'ranking' },
    { icon: DollarSign, label: 'Comissões', id: 'commissions' },
  ];

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="min-h-screen mesh-bg text-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass p-6 h-screen sticky top-0 z-10 border-r-0">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <span className="text-xl font-bold text-slate-100 italic tracking-tight">Ora</span>
        </div>

        <nav className="flex-1 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-white/10 text-sky-400 border-r-2 border-sky-400 rounded-r-none' 
                  : 'text-slate-400 hover:text-slate-100 opacity-60 hover:opacity-100'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform ${activeTab === item.id ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 p-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-100 font-bold glass">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-100 truncate">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{profile?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b-0 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="text-lg font-bold text-slate-100">Ora</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-100">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 top-16 glass border-0 z-40 p-6 flex flex-col"
          >
            <nav className="flex-1 space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl ${
                    activeTab === item.id ? 'bg-white/10 text-sky-400' : 'text-slate-400'
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-lg font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <button 
              onClick={handleLogout}
              className="mt-auto flex items-center gap-4 px-4 py-4 text-red-400 border-t border-white/10"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-lg font-medium">Sair</span>
            </button>
          </div>
        )}
      

      {/* Main Content Area */}
      <main className="flex-1 pt-24 lg:pt-0 p-6 lg:p-10 max-w-[1600px] mx-auto w-full overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-sky-400 font-bold uppercase tracking-widest">{profile?.role === 'admin' ? 'Painel Administrativo' : 'Painel do Vendedor'}</span>
            <h1 className="text-3xl font-bold text-slate-100">Olá, {profile?.name?.split(' ')[0]}</h1>
            <p className="text-slate-400 text-sm">{profile?.unit} | {profile?.municipality}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 glass rounded-xl flex items-center gap-2 border-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Sistema Ativo</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                 <p className="text-[10px] text-slate-500 uppercase">Ranking Atual</p>
                 <p className="text-lg font-bold text-amber-400">#03 / 48</p>
               </div>
               <div className="w-12 h-12 glass rounded-full flex items-center justify-center font-bold text-slate-100 border-sky-500/50">
                 {profile?.name?.charAt(0)}
               </div>
             </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
