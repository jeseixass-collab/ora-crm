import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  MapPin, 
  Phone,
  Building,
  Shield,
  Trash2,
  Edit2
} from 'lucide-react';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function SellersManager() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSeller, setNewSeller] = useState({
    name: '',
    email: '',
    type: 'PF',
    municipality: '',
    unit: '',
    whatsapp: '',
    monthlyGoal: 10000,
    role: 'seller',
    status: 'active'
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, you'd call a Cloud Function to create the Auth user.
      // Here we create the Firestore profile. For login, they'd need a matching Auth account.
      await addDoc(collection(db, 'users'), {
        ...newSeller,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewSeller({
        name: '', email: '', type: 'PF', municipality: '', unit: '', whatsapp: '', monthlyGoal: 10000, role: 'seller', status: 'active'
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar vendedor.');
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar vendedores por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 glass border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
        >
          <UserPlus className="w-5 h-5" />
          Novo Vendedor
        </button>
      </div>

      <div className="glass rounded-3xl border-0 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-widest">
              <th className="px-8 py-4 font-bold">Vendedor</th>
              <th className="px-8 py-4 font-bold">Tipo</th>
              <th className="px-8 py-4 font-bold">Localização</th>
              <th className="px-8 py-4 font-bold">Meta Mensal</th>
              <th className="px-8 py-4 font-bold">Status</th>
              <th className="px-8 py-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full glass border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                      {seller.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-100">{seller.name}</p>
                      <p className="text-xs text-slate-500">{seller.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4 text-sm font-medium">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${seller.type === 'PJ' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {seller.type}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-200">{seller.municipality}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{seller.unit}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-sm font-bold text-sky-400">
                  R$ {seller.monthlyGoal?.toLocaleString()}
                </td>
                <td className="px-8 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    seller.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {seller.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Cadastro */}
      
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
            <div
              className="glass border-sky-500/10 w-full max-w-2xl rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-100">Cadastrar Vendedor</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-100 transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddSeller} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={newSeller.name}
                    onChange={(e) => setNewSeller({...newSeller, name: e.target.value})}
                    className="w-full px-4 py-2.5 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-100"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">E-mail de Acesso</label>
                  <input
                    required
                    type="email"
                    value={newSeller.email}
                    onChange={(e) => setNewSeller({...newSeller, email: e.target.value})}
                    className="w-full px-4 py-2.5 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-100"
                    placeholder="Email para login"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo de Pessoa</label>
                  <select
                    value={newSeller.type}
                    onChange={(e) => setNewSeller({...newSeller, type: e.target.value})}
                    className="w-full px-4 py-2.5 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-100"
                  >
                    <option value="PF" className="bg-slate-900">Pessoa Física (PF)</option>
                    <option value="PJ" className="bg-slate-900">Pessoa Jurídica (PJ)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Meta Mensal (R$)</label>
                  <input
                    required
                    type="number"
                    value={newSeller.monthlyGoal}
                    onChange={(e) => setNewSeller({...newSeller, monthlyGoal: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unidade</label>
                  <input
                    required
                    type="text"
                    value={newSeller.unit}
                    onChange={(e) => setNewSeller({...newSeller, unit: e.target.value})}
                    className="w-full px-4 py-2.5 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-100"
                    placeholder="Unidade Regional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Município</label>
                  <input
                    required
                    type="text"
                    value={newSeller.municipality}
                    onChange={(e) => setNewSeller({...newSeller, municipality: e.target.value})}
                    className="w-full px-4 py-2.5 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-100"
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">WhatsApp</label>
                  <input
                    type="text"
                    value={newSeller.whatsapp}
                    onChange={(e) => setNewSeller({...newSeller, whatsapp: e.target.value})}
                    className="w-full px-4 py-2.5 glass border-0 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-100"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="md:col-span-2 pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 glass border-0 text-slate-400 font-bold rounded-xl hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-400 shadow-lg shadow-sky-500/20 transition-all"
                  >
                    Salvar Vendedor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      
    </div>
  );
}
