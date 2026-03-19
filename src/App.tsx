import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import Vendas from './pages/Vendas';
import Financeiro from './pages/Financeiro';
import Relatorios from './pages/Relatorios';
import Clientes from './pages/Clientes';
import Vendedores from './pages/Vendedores';
import LojaVirtual from './pages/LojaVirtual';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/loja" element={<LojaVirtual />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="vendedores" element={<Vendedores />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="relatorios" element={<Relatorios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
