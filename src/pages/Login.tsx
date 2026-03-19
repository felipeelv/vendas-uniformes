import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const { usuarios, login } = useStore();
  const [selectedUserId, setSelectedUserId] = useState(usuarios[0]?.id || '');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const sucesso = login(selectedUserId, senha);
    if (sucesso) {
      navigate('/dashboard');
    } else {
      setErro('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans tracking-tight relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-emerald-500/20 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-slate-900 font-extrabold text-4xl leading-none -mt-1">e</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Sistema Interno</h1>
          <p className="text-slate-400">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Usuário</label>
            <select
              value={selectedUserId}
              onChange={(e) => { setSelectedUserId(e.target.value); setErro(''); }}
              className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            >
              {usuarios.map(u => (
                <option key={u.id} value={u.id} className="text-slate-900">{u.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(''); }}
                placeholder="Digite sua senha"
                required
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/10 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {erro && (
            <p className="text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5">
              {erro}
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
          >
            <Lock className="w-5 h-5" />
            Entrar
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-6 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors mx-auto font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
