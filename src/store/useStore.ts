import { create } from 'zustand';

export type Tamanho = 'Infantil' | 'PP' | 'P' | 'M' | 'G' | 'GG' | 'EXG';
export type Categoria = 'Camiseta' | 'Calça' | 'Bermuda' | 'Moletom' | 'Casaco';

export interface Produto {
  id: string;
  nome: string;
  categoria: Categoria;
  tamanho: Tamanho;
  cor: string;
  quantidade: number;
  precoCusto: number;
  precoVenda: number;
  imagem?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  documento: string;
}

export interface Venda {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  valorTotal: number;
  data: string;
  vendedorId: string;
  vendedorNome: string;
  clienteId?: string;
  clienteNome?: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: 'Fixa' | 'Variável' | 'Fornecedor' | 'Outros';
}

export interface Usuario {
  id: string;
  nome: string;
  role: 'Admin' | 'Vendedor';
}

interface StoreState {
  usuarios: Usuario[];
  usuarioAtivo: Usuario | null;
  setUsuarioAtivo: (id: string) => void;
  produtos: Produto[];
  clientes: Cliente[];
  vendas: Venda[];
  despesas: Despesa[];
  addDespesa: (despesa: Omit<Despesa, 'id'>) => void;
  addProduto: (produto: Omit<Produto, 'id'>) => void;
  updateProduto: (id: string, produto: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  registrarEntrada: (id: string, quantidade: number) => void;
  registrarSaida: (id: string, quantidade: number, valorTotal: number, clienteId?: string, clienteNome?: string) => void;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
}

const mockUsuarios: Usuario[] = [
  { id: 'u1', nome: 'Felipe (Gerente)', role: 'Admin' },
  { id: 'u2', nome: 'Carlos (Vendedor)', role: 'Vendedor' },
  { id: 'u3', nome: 'Ana (Vendedora)', role: 'Vendedor' },
];

const mockClientes: Cliente[] = [
  { id: 'c1', nome: 'Mariana Silva (Mãe do Pedro)', telefone: '(11) 98765-4321', documento: '123.456.789-00' },
  { id: 'c2', nome: 'Roberto Alves', telefone: '(11) 91234-5678', documento: '987.654.321-11' },
];

const mockProdutos: Produto[] = [
  { id: '1', nome: 'Camiseta Padrão Manga Curta', categoria: 'Camiseta', tamanho: 'M', cor: 'Branca', quantidade: 45, precoCusto: 25.0, precoVenda: 45.0, imagem: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
  { id: '2', nome: 'Calça de Frio Oficial', categoria: 'Calça', tamanho: 'G', cor: 'Azul Marinho', quantidade: 12, precoCusto: 40.0, precoVenda: 89.9, imagem: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&q=80' },
  { id: '3', nome: 'Moletom com Capuz', categoria: 'Moletom', tamanho: 'P', cor: 'Cinza', quantidade: 5, precoCusto: 60.0, precoVenda: 120.0, imagem: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80' },
  { id: '4', nome: 'Bermuda Tactel Esportiva', categoria: 'Bermuda', tamanho: 'Infantil', cor: 'Azul', quantidade: 30, precoCusto: 20.0, precoVenda: 35.0, imagem: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80' },
];

const mockVendas: Venda[] = [
  { id: 'v1', produtoId: '1', produtoNome: 'Camiseta Padrão Manga Curta', quantidade: 2, valorTotal: 90.0, data: new Date(Date.now() - 86400000 * 2).toISOString(), vendedorId: 'u2', vendedorNome: 'Carlos (Vendedor)', clienteId: 'c1', clienteNome: 'Mariana Silva (Mãe do Pedro)' },
  { id: 'v2', produtoId: '4', produtoNome: 'Bermuda Tactel Esportiva', quantidade: 1, valorTotal: 35.0, data: new Date(Date.now() - 86400000 * 1).toISOString(), vendedorId: 'u3', vendedorNome: 'Ana (Vendedora)', clienteId: 'c2', clienteNome: 'Roberto Alves' },
];

const mockDespesas: Despesa[] = [
  { id: 'd1', descricao: 'Aluguel do Espaço', valor: 2500.0, data: new Date(Date.now() - 86400000 * 5).toISOString(), categoria: 'Fixa' },
];

export const useStore = create<StoreState>((set) => ({
  usuarios: mockUsuarios,
  usuarioAtivo: mockUsuarios[0],
  setUsuarioAtivo: (id) => set((state) => ({ usuarioAtivo: state.usuarios.find(u => u.id === id) || state.usuarioAtivo })),
  addUsuario: (usuario) => set(state => ({ usuarios: [...state.usuarios, { ...usuario, id: Math.random().toString(36).substr(2, 9) }] })),
  updateUsuario: (id, data) => set(state => {
    const updated = state.usuarios.map(u => u.id === id ? { ...u, ...data } : u);
    const active = state.usuarioAtivo?.id === id ? { ...state.usuarioAtivo, ...data } : state.usuarioAtivo;
    return { usuarios: updated, usuarioAtivo: active as Usuario };
  }),
  deleteUsuario: (id) => set(state => ({
    usuarios: state.usuarios.filter(u => u.id !== id),
    usuarioAtivo: state.usuarioAtivo?.id === id ? state.usuarios.find(u => u.id !== id) || null : state.usuarioAtivo
  })),
  produtos: mockProdutos,
  clientes: mockClientes,
  vendas: mockVendas,
  despesas: mockDespesas,
  addDespesa: (despesa) =>
    set((state) => ({
      despesas: [...state.despesas, { ...despesa, id: Math.random().toString(36).substr(2, 9) }],
    })),
  addProduto: (produto) =>
    set((state) => ({
      produtos: [...state.produtos, { ...produto, id: Math.random().toString(36).substr(2, 9) }],
    })),
  updateProduto: (id, updatedFields) =>
    set((state) => ({
      produtos: state.produtos.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
    })),
  deleteProduto: (id) =>
    set((state) => ({
      produtos: state.produtos.filter((p) => p.id !== id),
    })),
  addCliente: (cliente) =>
    set((state) => ({
      clientes: [...state.clientes, { ...cliente, id: Math.random().toString(36).substr(2, 9) }],
    })),
  updateCliente: (id, updatedFields) =>
    set((state) => ({
      clientes: state.clientes.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
    })),
  deleteCliente: (id) =>
    set((state) => ({
      clientes: state.clientes.filter((c) => c.id !== id),
    })),
  registrarEntrada: (id, qtd) =>
    set((state) => ({
      produtos: state.produtos.map((p) => (p.id === id ? { ...p, quantidade: p.quantidade + qtd } : p)),
    })),
  registrarSaida: (id, qtd, valorTotal, clienteId, clienteNome) =>
    set((state) => {
      const produto = state.produtos.find(p => p.id === id);
      const vendedor = state.usuarioAtivo;
      if (!produto || !vendedor) return state;
      
      const novaVenda: Venda = {
        id: Math.random().toString(36).substr(2, 9),
        produtoId: id,
        produtoNome: produto.nome,
        quantidade: qtd,
        valorTotal,
        data: new Date().toISOString(),
        vendedorId: vendedor.id,
        vendedorNome: vendedor.nome,
        clienteId,
        clienteNome
      };

      return {
        produtos: state.produtos.map((p) => (p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade - qtd) } : p)),
        vendas: [...state.vendas, novaVenda]
      };
    }),
}));
