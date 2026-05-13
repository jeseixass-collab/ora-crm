import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-6">
      <div 
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-500/20"
          >
            <span className="text-white font-bold text-3xl">O</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 italic tracking-tight">Ora</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">High Performance CRM</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-0 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl -mr-16 -mt-16"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 glass border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-100 placeholder:text-slate-600"
                  placeholder="admin@vendamax.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 glass border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-slate-100"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div 
                className="flex items-center gap-2 text-white text-xs bg-red-500/20 p-4 rounded-xl border border-red-500/20"
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-sky-500/20 active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'Processando Autenticação...' : 'Acessar Workspace'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Ambiente de Dados Protegido &bull; CRM v4.0
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          &copy; 2024 Ora System &bull; Intelligent Logistics
        </p>
      </div>
    </div>
  );
}
