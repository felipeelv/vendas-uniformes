import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, ShoppingCart, LogOut, PackageSearch, PieChart, Menu, X, Users, LineChart, UsersRound, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';

const sidebarLinks = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/vendas', icon: TrendingUp, label: 'Caixa / PDV' },
  { path: '/clientes', icon: UsersRound, label: 'CRM / Clientes' },
  { path: '/vendedores', icon: Users, label: 'Usuários' },
  { path: '/estoque', icon: PackageSearch, label: 'Estoque de Loja' },
  { path: '/financeiro', icon: PieChart, label: 'Financeiro' },
  { path: '/relatorios', icon: LineChart, label: 'Desempenho & Relatórios' },
  { path: '/fechamento', icon: Lock, label: 'Fechamento de Caixa' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { usuarioAtivo, usuarios, setUsuarioAtivo, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleNovaVenda = () => {
    navigate('/vendas');
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
        <h1 className="text-xl font-black flex items-center gap-2.5">
          <img src="/logo.png" alt="Eleve" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; document.getElementById('fallback-logo')?.classList.remove('hidden'); }} />
          <div id="fallback-logo" className="hidden w-8 h-8 rounded-lg bg-slate-500 flex items-center justify-center shadow-md shrink-0">
            <span className="text-white font-bold text-xl leading-none -mt-0.5">e</span>
          </div>
          <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight truncate">Colégio Eleve</span>
        </h1>
        {/* Mobile close button */}
        <button 
          className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        <button 
          onClick={handleNovaVenda}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-3.5 rounded-xl font-medium transition-all shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <ShoppingCart className="w-5 h-5" strokeWidth={2.5} /> 
          <span>Nova Venda</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3 mt-2">Navegação Principal</div>
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-violet-50/80 text-violet-700 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`
              }
            >
              <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 shrink-0`} />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors font-medium"
        >
          <LogOut className="h-5 w-5 shrink-0" /> <span className="truncate">Sair do Sistema</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 selection:bg-violet-200 selection:text-violet-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-slate-200 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white flex flex-col shadow-2xl z-50 md:hidden transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/40 relative h-screen overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight hidden sm:block">Controle de Vendas Colégio Eleve</h2>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight sm:hidden">Colégio Eleve</h2>
          </div>
          
          {/* User Profile Switcher */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-100/70 p-1.5 pr-4 rounded-full border border-slate-200/60">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-0.5">Operador Atual</span>
              <select 
                value={usuarioAtivo?.id || ''}
                onChange={(e) => setUsuarioAtivo(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer appearance-none leading-none"
              >
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-[1400px] mx-auto w-full pb-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
