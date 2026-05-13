import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Building2, 
  User, 
  Calendar, 
  DollarSign,
  MoreVertical,
  ExternalLink,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { calculateCommission } from '../../lib/commission';
import { format } from 'date-fns';

export default function SalesManager() {
  const { profile } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [newSale, setNewSale] = useState({
    clientName: '',
    value: 0,
    type: 'PF',
    status: 'proposta',
    unit: profile?.unit || '',
    municipality: profile?.municipality || '',
    sellerId: profile?.role === 'seller' ? profile.uid : '',
    driveUrl: ''
  });

  useEffect(() => {
    if (!profile) return;

    // Fetch sellers for admin to assign sales
    if (profile.role === 'admin') {
      const unsubSellers = onSnapshot(collection(db, 'users'), (snap) => {
        setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      
      const salesQuery = query(collection(db, 'sales'), orderBy('date', 'desc'));
      const unsubSales = onSnapshot(salesQuery, (snap) => {
        setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

      return () => { unsubSellers(); unsubSales(); };
    } else {
      const salesQuery = query(
        collection(db, 'sales'), 
        where('sellerId', '==', profile.uid),
        orderBy('date', 'desc')
      );
      const unsubSales = onSnapshot(salesQuery, (snap) => {
        setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return unsubSales;
    }
  }, [profile]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const sellerId = profile.role === 'admin' ? newSale.sellerId : profile.uid;
      
      // Calculate commission based on volume (this is a simplified logic, real app would count active month sales)
      const sellerSalesCount = sales.filter(s => s.sellerId === sellerId).length;
      const { total: commissionBase, total: totalComm } = calculateCommission(newSale.value, sellerSalesCount + 1);

      await addDoc(collection(db, 'sales'), {
        ...newSale,
        sellerId,
        commission: totalComm,
        date: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      setIsModalOpen(false);
      setNewSale({
        clientName: '', value: 0, type: 'PF', status: 'proposta',
        unit: profile?.unit || '', municipality: profile?.municipality || '',
        sellerId: profile?.role === 'seller' ? profile.uid : '', driveUrl: ''
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar contrato.');
    }
  };

  const filteredSales = sales.filter(s => 
    s.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar contratos por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 glass border-0 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-5 h-5" />
          Registrar Venda
        </button>
      </div>

      <div className="glass rounded-3xl border-0 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-widest">
              <th className="px-8 py-4 font-bold">Cliente</th>
              {profile?.role === 'admin' && <th className="px-8 py-4 font-bold">Vendedor</th>}
              <th className="px-8 py-4 font-bold">Valor</th>
              <th className="px-8 py-4 font-bold">Status</th>
              <th className="px-8 py-4 font-bold">Data</th>
              <th className="px-8 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={profile?.role === 'admin' ? 6 : 5} className="px-8 py-10 text-center">
                   <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400" />
                </td>
              </tr>
            ) : filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-100">{sale.clientName}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{sale.type}</span>
                  </div>
                </td>
                {profile?.role === 'admin' && (
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-slate-400">
                      {sellers.find(s => s.id === sale.sellerId)?.name || '---'}
                    </span>
                  </td>
                )}
                <td className="px-8 py-4 text-sm font-bold text-slate-100">
                  R$ {sale.value?.toLocaleString()}
                </td>
                <td className="px-8 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    sale.status === 'ativado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-sm text-slate-500">
                  {sale.date?.toDate ? format(sale.date.toDate(), 'dd/MM/yyyy') : '---'}
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {sale.driveUrl && (
                      <a href={sale.driveUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-sky-500/10 text-sky-400 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
            <div
              className="glass border-sky-500/10 w-full max-w-xl rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-slate-100 mb-6">Novo Contrato</h3>
              <form onSubmit={handleCreateSale} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cliente</label>
                    <input 
                      required
                      className="px-4 py-2 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-100 placeholder:text-slate-600"
                      value={newSale.clientName}
                      onChange={e => setNewSale({...newSale, clientName: e.target.value})}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor (R$)</label>
                    <input 
                      required
                      type="number"
                      className="px-4 py-2 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-100"
                      value={newSale.value}
                      onChange={e => setNewSale({...newSale, value: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tipo</label>
                    <select 
                      className="px-4 py-2 glass border-0 rounded-xl outline-none text-slate-100"
                      value={newSale.type}
                      onChange={e => setNewSale({...newSale, type: e.target.value})}
                    >
                      <option value="PF" className="bg-slate-900">Pessoa Física</option>
                      <option value="PJ" className="bg-slate-900">Pessoa Jurídica</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select 
                      className="px-4 py-2 glass border-0 rounded-xl outline-none text-slate-100"
                      value={newSale.status}
                      onChange={e => setNewSale({...newSale, status: e.target.value})}
                    >
                      <option value="proposta" className="bg-slate-900">Proposta</option>
                      <option value="assinado" className="bg-slate-900">Assinado</option>
                      <option value="ativado" className="bg-slate-900">Ativado</option>
                      <option value="pago" className="bg-slate-900">Pago</option>
                    </select>
                  </div>
                </div>

                {profile?.role === 'admin' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atribuir a Vendedor</label>
                    <select 
                      required
                      className="px-4 py-2 glass border-0 rounded-xl outline-none text-slate-100"
                      value={newSale.sellerId}
                      onChange={e => setNewSale({...newSale, sellerId: e.target.value})}
                    >
                      <option value="" className="bg-slate-900">Selecione um vendedor</option>
                      {sellers.map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Link Google Drive</label>
                  <input 
                    className="px-4 py-2 glass border-0 rounded-xl outline-none text-slate-100 placeholder:text-slate-600"
                    placeholder="https://drive.google.com/..."
                    value={newSale.driveUrl}
                    onChange={e => setNewSale({...newSale, driveUrl: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 glass border-0 text-slate-400 rounded-xl font-bold hover:bg-white/5 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400 shadow-lg shadow-sky-500/20 transition-all">Salvar Contrato</button>
                </div>
              </form>
            </div>
          </div>
        )}
      
    </div>
  );
}
