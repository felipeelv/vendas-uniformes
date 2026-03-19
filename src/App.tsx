import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import Vendas from './pages/Vendas';
import Financeiro from './pages/Financeiro';
import Relatorios from './pages/Relatorios';
import Clientes from './pages/Clientes';
import Vendedores from './pages/Vendedores';
import LojaVirtual from './pages/LojaVirtual';
import FechamentoCaixa from './pages/FechamentoCaixa';
import { useStore } from './store/useStore';

type UserRole = 'Admin' | 'Gerente' | 'Vendedor';

function RotaProtegida() {
  const isAutenticado = useStore((s) => s.isAutenticado);
  if (!isAutenticado) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RotaPorRole({ roles }: { roles: UserRole[] }) {
  const role = useStore((s) => s.usuarioAtivo?.role);
  if (!role || !roles.includes(role)) return <Navigate to="/vendas" replace />;
  return <Outlet />;
}

function App() {
  const loadData = useStore((s) => s.loadData);
  const loaded = useStore((s) => s.loaded);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg font-medium animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/loja" element={<LojaVirtual />} />

        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            {/* Acessível a todos */}
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/fechamento" element={<FechamentoCaixa />} />

            {/* Gerente + Admin */}
            <Route element={<RotaPorRole roles={['Admin', 'Gerente']} />}>
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/clientes" element={<Clientes />} />
            </Route>

            {/* Somente Admin */}
            <Route element={<RotaPorRole roles={['Admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vendedores" element={<Vendedores />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback caso a rota não exista */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
