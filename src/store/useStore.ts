import { create } from 'zustand';

export const TAMANHOS_PADRAO = ['4', '6', '8', '10', '12', '14', '16', 'PP', 'P', 'M', 'G', 'GG', 'XG'] as const;
export type Categoria = 'Camiseta' | 'Calça' | 'Bermuda' | 'Moletom' | 'Casaco';
export type TipoVenda = 'venda' | 'troca';
export type MetodoPagamento = 'PIX' | 'CARTAO' | 'DINHEIRO';
export type TipoItemVenda = 'saida' | 'entrada';

export interface Produto {
  id: string;
  nome: string;
  categoria: Categoria;
  tamanho: string;
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

export interface VendaItem {
  id: string;
  vendaId: string;
  tipoItem: TipoItemVenda;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
}

export interface Venda {
  id: string;
  tipoVenda: TipoVenda;
  metodoPagamento: MetodoPagamento;
  itens: VendaItem[];
  // Campos legados mantidos para retrocompatibilidade
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

export interface FechamentoCaixa {
  id: string;
  data: string;
  dataFechamento: string;
  operadorId: string;
  operadorNome: string;
  totalVendas: number;
  totalTrocas: number;
  quantidadeVendas: number;
  quantidadeTrocas: number;
  totalPix: number;
  totalCartao: number;
  totalDinheiro: number;
  status: 'fechado' | 'reaberto';
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
  senha: string;
}

interface ItemSaida {
  produtoId: string;
  quantidade: number;
  valorTotal: number;
}

interface ItemEntrada {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
}

interface StoreState {
  isAutenticado: boolean;
  login: (id: string, senha: string) => boolean;
  logout: () => void;
  usuarios: Usuario[];
  usuarioAtivo: Usuario | null;
  setUsuarioAtivo: (id: string) => void;
  produtos: Produto[];
  clientes: Cliente[];
  vendas: Venda[];
  despesas: Despesa[];
  fechamentosCaixa: FechamentoCaixa[];
  addDespesa: (despesa: Omit<Despesa, 'id'>) => void;
  addProduto: (produto: Omit<Produto, 'id'>) => void;
  updateProduto: (id: string, produto: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  registrarEntrada: (id: string, quantidade: number) => void;
  registrarVenda: (
    itens: ItemSaida[],
    metodoPagamento: MetodoPagamento,
    clienteId?: string,
    clienteNome?: string
  ) => void;
  registrarTroca: (
    itensEntrada: ItemEntrada[],
    itensSaida: ItemSaida[],
    metodoPagamento: MetodoPagamento,
    clienteId?: string,
    clienteNome?: string
  ) => void;
  fecharCaixa: (data: string) => void;
  reabrirCaixa: (id: string) => void;
  isCaixaFechado: (data: string) => boolean;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  tamanhosCustom: string[];
  addTamanhoCustom: (tamanho: string) => void;
  uploadImagem: (file: File) => Promise<string>;
}

const genId = () => Math.random().toString(36).substr(2, 9);

const getDateStr = (date: Date) => date.toISOString().split('T')[0];

const mockUsuarios: Usuario[] = [
  { id: 'u1', nome: 'Felipe (Gerente)', role: 'Admin', senha: '1234' },
  { id: 'u2', nome: 'Carlos (Vendedor)', role: 'Vendedor', senha: '1234' },
  { id: 'u3', nome: 'Ana (Vendedora)', role: 'Vendedor', senha: '1234' },
];

const mockClientes: Cliente[] = [
  { id: 'c1', nome: 'Mariana Silva (Mãe do Pedro)', telefone: '(11) 98765-4321', documento: '123.456.789-00' },
  { id: 'c2', nome: 'Roberto Alves', telefone: '(11) 91234-5678', documento: '987.654.321-11' },
];

const mockProdutos: Produto[] = [
  { id: '1', nome: 'Camiseta Padrão Manga Curta', categoria: 'Camiseta', tamanho: 'M', cor: 'Branca', quantidade: 45, precoCusto: 25.0, precoVenda: 45.0, imagem: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
  { id: '2', nome: 'Calça de Frio Oficial', categoria: 'Calça', tamanho: 'G', cor: 'Azul Marinho', quantidade: 12, precoCusto: 40.0, precoVenda: 89.9, imagem: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400&q=80' },
  { id: '3', nome: 'Moletom com Capuz', categoria: 'Moletom', tamanho: 'P', cor: 'Cinza', quantidade: 5, precoCusto: 60.0, precoVenda: 120.0, imagem: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80' },
  { id: '4', nome: 'Bermuda Tactel Esportiva', categoria: 'Bermuda', tamanho: '10', cor: 'Azul', quantidade: 30, precoCusto: 20.0, precoVenda: 35.0, imagem: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80' },
];

const mockVendas: Venda[] = [
  { id: 'v1', tipoVenda: 'venda', metodoPagamento: 'PIX', itens: [], produtoId: '1', produtoNome: 'Camiseta Padrão Manga Curta', quantidade: 2, valorTotal: 90.0, data: new Date(Date.now() - 86400000 * 2).toISOString(), vendedorId: 'u2', vendedorNome: 'Carlos (Vendedor)', clienteId: 'c1', clienteNome: 'Mariana Silva (Mãe do Pedro)' },
  { id: 'v2', tipoVenda: 'venda', metodoPagamento: 'DINHEIRO', itens: [], produtoId: '4', produtoNome: 'Bermuda Tactel Esportiva', quantidade: 1, valorTotal: 35.0, data: new Date(Date.now() - 86400000 * 1).toISOString(), vendedorId: 'u3', vendedorNome: 'Ana (Vendedora)', clienteId: 'c2', clienteNome: 'Roberto Alves' },
];

const mockDespesas: Despesa[] = [
  { id: 'd1', descricao: 'Aluguel do Espaço', valor: 2500.0, data: new Date(Date.now() - 86400000 * 5).toISOString(), categoria: 'Fixa' },
];

export const useStore = create<StoreState>((set, get) => ({
  isAutenticado: false,
  login: (id, senha) => {
    const usuario = get().usuarios.find(u => u.id === id);
    if (usuario && usuario.senha === senha) {
      set({ isAutenticado: true, usuarioAtivo: usuario });
      return true;
    }
    return false;
  },
  logout: () => set({ isAutenticado: false, usuarioAtivo: null }),
  usuarios: mockUsuarios,
  usuarioAtivo: null,
  setUsuarioAtivo: (id) => set((state) => ({ usuarioAtivo: state.usuarios.find(u => u.id === id) || state.usuarioAtivo })),
  addUsuario: (usuario) => set(state => ({ usuarios: [...state.usuarios, { ...usuario, id: genId() }] })),
  updateUsuario: (id, data) => set(state => {
    const updated = state.usuarios.map(u => u.id === id ? { ...u, ...data } : u);
    const active = state.usuarioAtivo?.id === id ? { ...state.usuarioAtivo, ...data } : state.usuarioAtivo;
    return { usuarios: updated, usuarioAtivo: active as Usuario };
  }),
  deleteUsuario: (id) => set(state => ({
    usuarios: state.usuarios.filter(u => u.id !== id),
    usuarioAtivo: state.usuarioAtivo?.id === id ? state.usuarios.find(u => u.id !== id) || null : state.usuarioAtivo
  })),
  tamanhosCustom: [],
  addTamanhoCustom: (tamanho) => set(state => ({
    tamanhosCustom: state.tamanhosCustom.includes(tamanho) ? state.tamanhosCustom : [...state.tamanhosCustom, tamanho]
  })),
  produtos: mockProdutos,
  clientes: mockClientes,
  vendas: mockVendas,
  despesas: mockDespesas,
  fechamentosCaixa: [],
  addDespesa: (despesa) =>
    set((state) => ({
      despesas: [...state.despesas, { ...despesa, id: genId() }],
    })),
  addProduto: (produto) =>
    set((state) => ({
      produtos: [...state.produtos, { ...produto, id: genId() }],
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
      clientes: [...state.clientes, { ...cliente, id: genId() }],
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

  registrarVenda: (itens, metodoPagamento, clienteId, clienteNome) =>
    set((state) => {
      const vendedor = get().usuarioAtivo;
      if (!vendedor || itens.length === 0) return state;

      // Checar fechamento de caixa
      const hoje = getDateStr(new Date());
      if (get().isCaixaFechado(hoje)) return state;

      const vendaId = genId();
      const primeiroProduto = state.produtos.find(p => p.id === itens[0].produtoId);

      const vendaItens: VendaItem[] = itens.map(item => {
        const produto = state.produtos.find(p => p.id === item.produtoId);
        return {
          id: genId(),
          vendaId,
          tipoItem: 'saida' as TipoItemVenda,
          produtoId: item.produtoId,
          produtoNome: produto?.nome || 'Produto removido',
          quantidade: item.quantidade,
          precoUnitario: produto ? item.valorTotal / item.quantidade : 0,
          valorTotal: item.valorTotal,
        };
      });

      const totalGeral = itens.reduce((acc, item) => acc + item.valorTotal, 0);

      const novaVenda: Venda = {
        id: vendaId,
        tipoVenda: 'venda',
        metodoPagamento,
        itens: vendaItens,
        produtoId: itens[0].produtoId,
        produtoNome: primeiroProduto?.nome || 'Produto removido',
        quantidade: itens.reduce((acc, item) => acc + item.quantidade, 0),
        valorTotal: totalGeral,
        data: new Date().toISOString(),
        vendedorId: vendedor.id,
        vendedorNome: vendedor.nome,
        clienteId,
        clienteNome,
      };

      // Decrementar estoque de todos os itens
      const novoProdutos = state.produtos.map(p => {
        const itemVenda = itens.find(i => i.produtoId === p.id);
        if (itemVenda) {
          return { ...p, quantidade: Math.max(0, p.quantidade - itemVenda.quantidade) };
        }
        return p;
      });

      return {
        produtos: novoProdutos,
        vendas: [...state.vendas, novaVenda],
      };
    }),

  registrarTroca: (itensEntrada, itensSaida, metodoPagamento, clienteId, clienteNome) =>
    set((state) => {
      const vendedor = get().usuarioAtivo;
      if (!vendedor) return state;
      if (itensSaida.length === 0 && itensEntrada.length === 0) return state;

      // Checar fechamento de caixa
      const hoje = getDateStr(new Date());
      if (get().isCaixaFechado(hoje)) return state;

      const vendaId = genId();

      // Itens de entrada (devolvidos)
      const vendaItensEntrada: VendaItem[] = itensEntrada.map(item => ({
        id: genId(),
        vendaId,
        tipoItem: 'entrada' as TipoItemVenda,
        produtoId: item.produtoId,
        produtoNome: item.produtoNome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        valorTotal: item.valorTotal,
      }));

      // Itens de saida (novos produtos)
      const vendaItensSaida: VendaItem[] = itensSaida.map(item => {
        const produto = state.produtos.find(p => p.id === item.produtoId);
        return {
          id: genId(),
          vendaId,
          tipoItem: 'saida' as TipoItemVenda,
          produtoId: item.produtoId,
          produtoNome: produto?.nome || 'Produto removido',
          quantidade: item.quantidade,
          precoUnitario: produto ? item.valorTotal / item.quantidade : 0,
          valorTotal: item.valorTotal,
        };
      });

      const totalSaida = itensSaida.reduce((acc, item) => acc + item.valorTotal, 0);
      const totalEntrada = itensEntrada.reduce((acc, item) => acc + item.valorTotal, 0);
      const diferenca = totalSaida - totalEntrada;

      const primeiroProdutoSaida = itensSaida.length > 0
        ? state.produtos.find(p => p.id === itensSaida[0].produtoId)
        : null;

      const novaVenda: Venda = {
        id: vendaId,
        tipoVenda: 'troca',
        metodoPagamento,
        itens: [...vendaItensEntrada, ...vendaItensSaida],
        produtoId: itensSaida[0]?.produtoId || itensEntrada[0]?.produtoId || '',
        produtoNome: primeiroProdutoSaida?.nome || itensEntrada[0]?.produtoNome || 'Troca',
        quantidade: itensSaida.reduce((acc, item) => acc + item.quantidade, 0),
        valorTotal: diferenca,
        data: new Date().toISOString(),
        vendedorId: vendedor.id,
        vendedorNome: vendedor.nome,
        clienteId,
        clienteNome,
      };

      // Atualizar estoque: incrementar devolvidos, decrementar novos
      const novoProdutos = state.produtos.map(p => {
        const itemEntrada = itensEntrada.find(i => i.produtoId === p.id);
        const itemSaida = itensSaida.find(i => i.produtoId === p.id);
        let novaQtd = p.quantidade;
        if (itemEntrada) novaQtd += itemEntrada.quantidade;
        if (itemSaida) novaQtd = Math.max(0, novaQtd - itemSaida.quantidade);
        return { ...p, quantidade: novaQtd };
      });

      return {
        produtos: novoProdutos,
        vendas: [...state.vendas, novaVenda],
      };
    }),

  fecharCaixa: (data) =>
    set((state) => {
      const vendedor = get().usuarioAtivo;
      if (!vendedor) return state;

      // Verificar se ja esta fechado
      const jaFechado = state.fechamentosCaixa.find(f => f.data === data && f.status === 'fechado');
      if (jaFechado) return state;

      // Filtrar vendas do dia
      const vendasDoDia = state.vendas.filter(v => getDateStr(new Date(v.data)) === data);

      const vendas = vendasDoDia.filter(v => v.tipoVenda === 'venda');
      const trocas = vendasDoDia.filter(v => v.tipoVenda === 'troca');

      const totalVendas = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
      const totalTrocas = trocas.reduce((acc, v) => acc + v.valorTotal, 0);

      const totalPix = vendasDoDia.filter(v => v.metodoPagamento === 'PIX').reduce((acc, v) => acc + v.valorTotal, 0);
      const totalCartao = vendasDoDia.filter(v => v.metodoPagamento === 'CARTAO').reduce((acc, v) => acc + v.valorTotal, 0);
      const totalDinheiro = vendasDoDia.filter(v => v.metodoPagamento === 'DINHEIRO').reduce((acc, v) => acc + v.valorTotal, 0);

      const fechamento: FechamentoCaixa = {
        id: genId(),
        data,
        dataFechamento: new Date().toISOString(),
        operadorId: vendedor.id,
        operadorNome: vendedor.nome,
        totalVendas,
        totalTrocas,
        quantidadeVendas: vendas.length,
        quantidadeTrocas: trocas.length,
        totalPix,
        totalCartao,
        totalDinheiro,
        status: 'fechado',
      };

      // Substituir fechamento existente (reaberto) ou adicionar novo
      const existente = state.fechamentosCaixa.findIndex(f => f.data === data);
      let novosFechamentos: FechamentoCaixa[];
      if (existente >= 0) {
        novosFechamentos = state.fechamentosCaixa.map((f, i) => i === existente ? fechamento : f);
      } else {
        novosFechamentos = [...state.fechamentosCaixa, fechamento];
      }

      return { fechamentosCaixa: novosFechamentos };
    }),

  reabrirCaixa: (id) =>
    set((state) => {
      const usuario = get().usuarioAtivo;
      if (!usuario || usuario.role !== 'Admin') return state;

      return {
        fechamentosCaixa: state.fechamentosCaixa.map(f =>
          f.id === id ? { ...f, status: 'reaberto' as const } : f
        ),
      };
    }),

  isCaixaFechado: (data) => {
    const state = get();
    return state.fechamentosCaixa.some(f => f.data === data && f.status === 'fechado');
  },

  uploadImagem: async (file: File) => {
    // Fallback local: cria uma URL temporaria para a imagem
    return URL.createObjectURL(file);
  },
}));
