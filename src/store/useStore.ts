import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const TAMANHOS_PADRAO = ['4', '6', '8', '10', '12', '14', '16', 'PP', 'P', 'M', 'G', 'GG', 'XG'] as const;
export type Categoria = 'Camiseta' | 'Calça' | 'Bermuda' | 'Moletom' | 'Casaco';

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

// Helpers para converter entre camelCase (app) e snake_case (DB)
function produtoFromDb(row: any): Produto {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    tamanho: row.tamanho,
    cor: row.cor,
    quantidade: row.quantidade,
    precoCusto: Number(row.preco_custo),
    precoVenda: Number(row.preco_venda),
    imagem: row.imagem || undefined,
  };
}

function produtoToDb(p: Partial<Produto>) {
  const row: any = {};
  if (p.nome !== undefined) row.nome = p.nome;
  if (p.categoria !== undefined) row.categoria = p.categoria;
  if (p.tamanho !== undefined) row.tamanho = p.tamanho;
  if (p.cor !== undefined) row.cor = p.cor;
  if (p.quantidade !== undefined) row.quantidade = p.quantidade;
  if (p.precoCusto !== undefined) row.preco_custo = p.precoCusto;
  if (p.precoVenda !== undefined) row.preco_venda = p.precoVenda;
  if (p.imagem !== undefined) row.imagem = p.imagem;
  return row;
}

function vendaFromDb(row: any): Venda {
  return {
    id: row.id,
    produtoId: row.produto_id || '',
    produtoNome: row.produto_nome,
    quantidade: row.quantidade,
    valorTotal: Number(row.valor_total),
    data: row.data,
    vendedorId: row.vendedor_id || '',
    vendedorNome: row.vendedor_nome,
    clienteId: row.cliente_id || undefined,
    clienteNome: row.cliente_nome || undefined,
  };
}

interface StoreState {
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;

  usuarios: Usuario[];
  usuarioAtivo: Usuario | null;
  setUsuarioAtivo: (id: string) => void;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<void>;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;

  produtos: Produto[];
  addProduto: (produto: Omit<Produto, 'id'>) => Promise<void>;
  updateProduto: (id: string, produto: Partial<Produto>) => Promise<void>;
  deleteProduto: (id: string) => Promise<void>;
  registrarEntrada: (id: string, quantidade: number) => Promise<void>;
  registrarSaida: (id: string, quantidade: number, valorTotal: number, clienteId?: string, clienteNome?: string) => Promise<void>;

  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;

  vendas: Venda[];
  despesas: Despesa[];
  addDespesa: (despesa: Omit<Despesa, 'id'>) => Promise<void>;

  tamanhosCustom: string[];
  addTamanhoCustom: (tamanho: string) => Promise<void>;

  uploadImagem: (file: File) => Promise<string>;
}

export const useStore = create<StoreState>((set, get) => ({
  loading: true,
  initialized: false,

  // ==================== INIT ====================
  init: async () => {
    if (get().initialized) return;

    const [
      { data: usuarios },
      { data: produtos },
      { data: clientes },
      { data: vendas },
      { data: despesas },
      { data: tamanhosCustom },
    ] = await Promise.all([
      supabase.from('usuarios').select('*').order('created_at'),
      supabase.from('produtos').select('*').order('created_at'),
      supabase.from('clientes').select('*').order('created_at'),
      supabase.from('vendas').select('*').order('data', { ascending: false }),
      supabase.from('despesas').select('*').order('data', { ascending: false }),
      supabase.from('tamanhos_custom').select('*').order('created_at'),
    ]);

    const mappedUsuarios = (usuarios || []).map((u: any) => ({ id: u.id, nome: u.nome, role: u.role })) as Usuario[];
    const mappedProdutos = (produtos || []).map(produtoFromDb);
    const mappedClientes = (clientes || []).map((c: any) => ({ id: c.id, nome: c.nome, telefone: c.telefone, documento: c.documento })) as Cliente[];
    const mappedVendas = (vendas || []).map(vendaFromDb);
    const mappedDespesas = (despesas || []).map((d: any) => ({ id: d.id, descricao: d.descricao, valor: Number(d.valor), data: d.data, categoria: d.categoria })) as Despesa[];
    const mappedTamanhos = (tamanhosCustom || []).map((t: any) => t.tamanho as string);

    set({
      usuarios: mappedUsuarios,
      usuarioAtivo: mappedUsuarios[0] || null,
      produtos: mappedProdutos,
      clientes: mappedClientes,
      vendas: mappedVendas,
      despesas: mappedDespesas,
      tamanhosCustom: mappedTamanhos,
      loading: false,
      initialized: true,
    });
  },

  // ==================== USUARIOS ====================
  usuarios: [],
  usuarioAtivo: null,

  setUsuarioAtivo: (id) => set((state) => ({
    usuarioAtivo: state.usuarios.find(u => u.id === id) || state.usuarioAtivo
  })),

  addUsuario: async (usuario) => {
    const { data, error } = await supabase.from('usuarios').insert(usuario).select().single();
    if (error) throw error;
    const novo: Usuario = { id: data.id, nome: data.nome, role: data.role };
    set(state => ({ usuarios: [...state.usuarios, novo] }));
  },

  updateUsuario: async (id, updates) => {
    const { error } = await supabase.from('usuarios').update(updates).eq('id', id);
    if (error) throw error;
    set(state => {
      const updated = state.usuarios.map(u => u.id === id ? { ...u, ...updates } : u);
      const active = state.usuarioAtivo?.id === id ? { ...state.usuarioAtivo, ...updates } : state.usuarioAtivo;
      return { usuarios: updated, usuarioAtivo: active as Usuario };
    });
  },

  deleteUsuario: async (id) => {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) throw error;
    set(state => ({
      usuarios: state.usuarios.filter(u => u.id !== id),
      usuarioAtivo: state.usuarioAtivo?.id === id ? state.usuarios.find(u => u.id !== id) || null : state.usuarioAtivo,
    }));
  },

  // ==================== PRODUTOS ====================
  produtos: [],

  addProduto: async (produto) => {
    const { data, error } = await supabase.from('produtos').insert(produtoToDb(produto)).select().single();
    if (error) throw error;
    set(state => ({ produtos: [...state.produtos, produtoFromDb(data)] }));
  },

  updateProduto: async (id, updates) => {
    const { error } = await supabase.from('produtos').update(produtoToDb(updates)).eq('id', id);
    if (error) throw error;
    set(state => ({
      produtos: state.produtos.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  },

  deleteProduto: async (id) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ produtos: state.produtos.filter(p => p.id !== id) }));
  },

  registrarEntrada: async (id, qtd) => {
    const produto = get().produtos.find(p => p.id === id);
    if (!produto) return;
    const novaQtd = produto.quantidade + qtd;
    const { error } = await supabase.from('produtos').update({ quantidade: novaQtd }).eq('id', id);
    if (error) throw error;
    set(state => ({
      produtos: state.produtos.map(p => p.id === id ? { ...p, quantidade: novaQtd } : p),
    }));
  },

  registrarSaida: async (id, qtd, valorTotal, clienteId, clienteNome) => {
    const produto = get().produtos.find(p => p.id === id);
    const vendedor = get().usuarioAtivo;
    if (!produto || !vendedor) return;

    const novaQtd = Math.max(0, produto.quantidade - qtd);

    const vendaRow = {
      produto_id: id,
      produto_nome: produto.nome,
      quantidade: qtd,
      valor_total: valorTotal,
      data: new Date().toISOString(),
      vendedor_id: vendedor.id,
      vendedor_nome: vendedor.nome,
      cliente_id: clienteId || null,
      cliente_nome: clienteNome || null,
    };

    const [{ error: errVenda, data: vendaData }, { error: errProd }] = await Promise.all([
      supabase.from('vendas').insert(vendaRow).select().single(),
      supabase.from('produtos').update({ quantidade: novaQtd }).eq('id', id),
    ]);

    if (errVenda) throw errVenda;
    if (errProd) throw errProd;

    set(state => ({
      produtos: state.produtos.map(p => p.id === id ? { ...p, quantidade: novaQtd } : p),
      vendas: [vendaFromDb(vendaData), ...state.vendas],
    }));
  },

  // ==================== CLIENTES ====================
  clientes: [],

  addCliente: async (cliente) => {
    const { data, error } = await supabase.from('clientes').insert(cliente).select().single();
    if (error) throw error;
    const novo: Cliente = { id: data.id, nome: data.nome, telefone: data.telefone, documento: data.documento };
    set(state => ({ clientes: [...state.clientes, novo] }));
  },

  updateCliente: async (id, updates) => {
    const { error } = await supabase.from('clientes').update(updates).eq('id', id);
    if (error) throw error;
    set(state => ({
      clientes: state.clientes.map(c => c.id === id ? { ...c, ...updates } : c),
    }));
  },

  deleteCliente: async (id) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
    set(state => ({ clientes: state.clientes.filter(c => c.id !== id) }));
  },

  // ==================== VENDAS & DESPESAS ====================
  vendas: [],
  despesas: [],

  addDespesa: async (despesa) => {
    const { data, error } = await supabase.from('despesas').insert(despesa).select().single();
    if (error) throw error;
    const nova: Despesa = { id: data.id, descricao: data.descricao, valor: Number(data.valor), data: data.data, categoria: data.categoria };
    set(state => ({ despesas: [nova, ...state.despesas] }));
  },

  // ==================== TAMANHOS CUSTOM ====================
  tamanhosCustom: [],

  addTamanhoCustom: async (tamanho) => {
    if (get().tamanhosCustom.includes(tamanho)) return;
    const { error } = await supabase.from('tamanhos_custom').insert({ tamanho });
    if (error && error.code !== '23505') throw error; // ignore duplicate
    set(state => ({
      tamanhosCustom: state.tamanhosCustom.includes(tamanho) ? state.tamanhosCustom : [...state.tamanhosCustom, tamanho],
    }));
  },

  // ==================== UPLOAD DE IMAGEM ====================
  uploadImagem: async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    const { error } = await supabase.storage
      .from('produto-imagens')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('produto-imagens')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },
}));
