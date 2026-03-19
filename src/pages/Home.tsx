import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans tracking-tight relative overflow-hidden">
      
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-emerald-500/20 rounded-[100%] blur-[120px] pointer-events-none" />
      
      <div className="z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center mx-auto mb-8 relative after:absolute after:inset-0 after:rounded-[2rem] after:ring-1 after:ring-slate-900/5 overflow-hidden p-4">
          <img src="/logo.png" alt="Colégio Eleve" className="w-full h-full object-contain" />
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black text-white mb-4">Colégio Eleve</h1>
        <p className="text-lg sm:text-xl font-medium text-slate-400 max-w-lg mx-auto mb-12">
          Bem-vindo! Escolha abaixo qual sistema você deseja acessar.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md mx-auto">
          <button
            onClick={() => navigate('/login')}
            className="group w-full flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-5 rounded-2xl font-black text-lg shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Lock className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            Acessar Sistema Interno
          </button>
          
          <button
            onClick={() => navigate('/loja')}
            className="group w-full flex items-center justify-center gap-3 bg-slate-800 text-white border-2 border-slate-700 px-6 py-[18px] rounded-2xl font-bold text-lg hover:border-slate-500 hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag className="w-5 h-5 text-slate-300 group-hover:scale-110 transition-transform" />
            Acessar Loja Virtual
          </button>
        </div>
      </div>
    </div>
  );
}
