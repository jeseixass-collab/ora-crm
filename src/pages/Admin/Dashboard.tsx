import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileCheck, 
  TrendingUp, 
  MapPin, 
  PieChart as PieIcon,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const [sales, setSales] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sellersUnsub = onSnapshot(collection(db, 'users'), (snap) => {
      setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const salesUnsub = onSnapshot(query(collection(db, 'sales'), orderBy('date', 'desc')), (snap) => {
      setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      sellersUnsub();
      salesUnsub();
    };
  }, []);

  const stats = {
    totalRevenue: sales.reduce((acc, s) => acc + (s.value || 0), 0),
    totalSales: sales.length,
    activeSellers: sellers.filter(s => s.role === 'seller' && s.status === 'active').length,
    pendingContracts: sales.filter(s => s.status !== 'ativado' && s.status !== 'pago').length,
  };

  // Performance by Unit
  const unitData = Object.entries(
    sales.reduce((acc: any, s) => {
      const unit = s.unit || 'Sem Unidade';
      acc[unit] = (acc[unit] || 0) + s.value;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Top Sellers
  const topSellers = Object.entries(
    sales.reduce((acc: any, s) => {
      const seller = sellers.find(sel => sel.id === s.sellerId)?.name || 'Desconhecido';
      acc[seller] = (acc[seller] || 0) + s.value;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 5);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) return null;

  return (
    <div className="space-y-8 pb-10">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Faturamento Total" value={`R$ ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="blue" />
        <AdminStatCard title="Vendedores Ativos" value={stats.activeSellers.toString()} icon={Users} color="green" />
        <AdminStatCard title="Total Contratos" value={stats.totalSales.toString()} icon={FileCheck} color="purple" />
        <AdminStatCard title="Pendências" value={stats.pendingContracts.toString()} icon={MapPin} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance by Seller */}
        <div className="glass p-8 rounded-3xl border-0 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-100">Top Vendedores</h3>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Filter className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellers}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                <ReTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', background: 'rgba(15, 23, 42, 0.9)'}} />
                <Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution by Unit */}
        <div className="glass p-8 rounded-3xl border-0 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-8">Distribuição por Unidade</h3>
          <div className="h-[300px] flex flex-col sm:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={unitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {unitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full sm:w-48 space-y-4">
              {unitData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                  <span className="text-xs font-medium text-slate-400 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Global Sales */}
      <div className="glass rounded-3xl border-0 shadow-sm overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
           <h3 className="text-lg font-bold text-slate-100">Monitoramento em Tempo Real</h3>
           <div className="flex gap-2">
             <button className="px-4 py-2 text-xs font-bold bg-white/10 text-slate-100 uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors">
               Exportar Dados
             </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-white/10">
                <th className="px-8 py-4 font-bold">Vendedor</th>
                <th className="px-8 py-4 font-bold">Cliente</th>
                <th className="px-8 py-4 font-bold">Valor</th>
                <th className="px-8 py-4 font-bold">Unidade</th>
                <th className="px-8 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sales.slice(0, 8).map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold">
                        {sellers.find(s => s.id === sale.sellerId)?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-bold text-slate-100">
                        {sellers.find(s => s.id === sale.sellerId)?.name || 'Vendedor Removido'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-400">{sale.clientName}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-100">R$ {sale.value?.toLocaleString()}</td>
                  <td className="px-8 py-4 text-sm text-slate-500">{sale.unit}</td>
                  <td className="px-8 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      sale.status === 'ativado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'glass text-sky-400 border-0',
    green: 'glass text-emerald-400 border-0',
    purple: 'glass text-purple-400 border-0',
    orange: 'glass text-amber-400 border-0',
  };

  return (
    <div className="glass p-6 rounded-3xl border-0 shadow-sm flex items-center gap-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-0.5">{title}</p>
        <h4 className="text-2xl font-bold text-slate-100">{value}</h4>
      </div>
    </div>
  );
}
