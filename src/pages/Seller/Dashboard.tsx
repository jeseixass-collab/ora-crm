import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Trophy,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    const salesQuery = query(
      collection(db, 'sales'),
      where('sellerId', '==', profile.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSales(salesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.uid]);

  const stats = {
    totalValue: sales.reduce((acc, s) => acc + (s.value || 0), 0),
    activatedCount: sales.filter(s => s.status === 'ativado').length,
    pendingCount: sales.filter(s => s.status === 'proposta' || s.status === 'assinado').length,
    totalCommission: sales.reduce((acc, s) => acc + (s.commission || 0) + (s.bonus || 0), 0),
  };

  const monthlyGoal = profile?.monthlyGoal || 10000;
  const goalProgress = Math.min((stats.totalValue / monthlyGoal) * 100, 100);

  // Sample chart data (real app would group sales by day/month)
  const chartData = [
    { name: 'Seg', value: 400 },
    { name: 'Ter', value: 300 },
    { name: 'Qua', value: 800 },
    { name: 'Qui', value: 500 },
    { name: 'Sex', value: 1200 },
    { name: 'Sab', value: 900 },
    { name: 'Dom', value: 1100 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Valor Total" 
          value={`R$ ${stats.totalValue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="+12%" 
          color="indigo" 
        />
        <StatCard 
          title="Contratos Ativos" 
          value={stats.activatedCount.toString()} 
          icon={CheckCircle2} 
          trend="+3" 
          color="green" 
        />
        <StatCard 
          title="Pendentes" 
          value={stats.pendingCount.toString()} 
          icon={Clock} 
          trend="-2" 
          color="orange" 
        />
        <StatCard 
          title="Comissão Total" 
          value={`R$ ${stats.totalCommission.toLocaleString()}`} 
          icon={Trophy} 
          trend="+R$ 450" 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border-0 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Desempenho Semanal</h3>
              <p className="text-sm text-slate-400">Progresso das vendas nos últimos 7 dias</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#F1F5F9' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Goal Column */}
        <div className="glass p-8 rounded-3xl border-0 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/20">
              <Target className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-1">Meta Mensal</h3>
            <p className="text-slate-400 text-sm mb-8">Acompanhe seu progresso atual.</p>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-slate-400">Progresso</span>
                <span className="text-2xl font-bold text-sky-400">{goalProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>R$ 0</span>
                <span>Alvo: R$ {monthlyGoal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/10 italic text-sm text-slate-300">
            "Faltam apenas <span className="text-sky-400 font-bold italic-none">R$ {(monthlyGoal - stats.totalValue > 0 ? monthlyGoal - stats.totalValue : 0).toLocaleString()}</span> para atingir sua meta!"
          </div>
        </div>
      </div>

      {/* Recent Sales List */}
      <div className="glass rounded-3xl border-0 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">Últimos Contratos</h3>
          <button className="text-xs font-bold text-sky-400 uppercase tracking-widest hover:text-sky-300 transition-colors">
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-white/10">
                <th className="px-8 py-4 font-bold">Cliente</th>
                <th className="px-8 py-4 font-bold">Data</th>
                <th className="px-8 py-4 font-bold">Valor</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold text-right">Comissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-4">
                    <span className="font-bold text-slate-100">{sale.clientName}</span>
                  </td>
                  <td className="px-8 py-4 text-slate-400 text-sm">
                    {sale.date?.toDate ? format(sale.date.toDate(), 'dd MMM, yyyy', { locale: ptBR }) : '---'}
                  </td>
                  <td className="px-8 py-4 font-medium text-slate-100">
                    R$ {sale.value?.toLocaleString()}
                  </td>
                  <td className="px-8 py-4">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="px-8 py-4 text-right">
                    <span className="font-bold text-sky-400 group-hover:scale-105 inline-block transition-transform">
                      R$ {(sale.commission || 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-500">
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    indigo: 'glass text-sky-400 border-0',
    green: 'glass text-emerald-400 border-0',
    orange: 'glass text-amber-400 border-0',
    purple: 'glass text-purple-400 border-0',
  };

  return (
    <div className="glass p-6 rounded-3xl border-0 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-bold text-slate-100">{value}</h4>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    proposta: 'bg-blue-500/20 text-blue-400',
    assinado: 'bg-orange-500/20 text-orange-400',
    ativado: 'bg-emerald-500/20 text-emerald-400',
    pago: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
}
