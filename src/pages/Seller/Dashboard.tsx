import React, { useEffect, useState } from 'react';
import { Users, FileCheck, TrendingUp, MapPin, Filter } from 'lucide-react';
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
    return () => { sellersUnsub(); salesUnsub(); };
  }, []);

  const stats = {
    totalRevenue: sales.reduce((acc, s) => acc + (s.value || 0), 0),
    totalSales: sales.length,
    activeSellers: sellers.filter(s => s.role === 'seller' && s.status === 'active').length,
    pendingContracts: sales.filter(s => s.status !== 'ativado' && s.status !== 'pago').length,
  };

  const topSellers = Object.entries(
    sales.reduce((acc: any, s) => {
      const seller = sellers.find(sel => sel.id === s.sellerId)?.name || 'Desconhecido';
      acc[seller] = (acc[seller] || 0) + s.value;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value).slice(0, 5);

  const maxValue = topSellers[0]?.value || 1;
  const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Faturamento Total" value={`R$ ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} color="blue" />
        <AdminStatCard title="Vendedores Ativos" value={stats.activeSellers.toString()} icon={Users} color="green" />
        <AdminStatCard title="Total Contratos" value={stats.totalSales.toString()} icon={FileCheck} color="purple" />
        <AdminStatCard title="Pendências" value={stats.pendingContracts.toString()} icon={MapPin} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl border-0 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-100">Top Vendedores</h3>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Filter className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          {topSellers.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Nenhuma venda registrada ainda.</div>
          ) : (
            <div className="space-y-4">
              {topSellers.map((s, i) => (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{s.name}</span>
                    <span className="text-slate-400">R$ {s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(s.value / maxValue) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass p-8 rounded-3xl border-0 shadow-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-6">Resumo de Contratos</h3>
          {sales.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Nenhuma venda registrada ainda.</div>
          ) : (
            <div className="space-y-3">
              {['proposta','assinado','ativado','pago'].map((status, i) => {
                const count = sales.filter(s => s.status === status).length;
                const pct = sales.length ? Math.round((count / sales.length) * 100) : 0;
                const colors = ['#3B82F6','#F59E0B','#10B981','#8B5CF6'];
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium capitalize">{status}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-3xl border-0 shadow-sm overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
          <h3 className="text-lg font-bold text-slate-100">Monitoramento em Tempo Real</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-white/10">
                <th className="px-8 py-4 font-bold">Vendedor</th>
                <th className="px-8 py-4 font-bold">Cliente</th>
                <th className="px-8 py-4 font-bold">Valor</th>
                <th className="px-8 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sales.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-500">Nenhuma venda registrada ainda.</td></tr>
              ) : sales.slice(0, 8).map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold">
                        {sellers.find(s => s.id === sale.sellerId)?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-bold text-slate-100">{sellers.find(s => s.id === sale.sellerId)?.name || 'Vendedor Removido'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-400">{sale.clientName}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-100">R$ {sale.value?.toLocaleString()}</td>
                  <td className="px-8 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${sale.status === 'ativado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
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
