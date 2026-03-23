import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const TAMANHOS_PADRAO = ['2', '4', '6', '8', '10', '12', '14', '16', 'PP', 'P', 'M', 'G', 'GG', 'XG', 'G1'] as const;
export type Categoria = 'Camiseta' | 'Calça' | 'Bermuda' | 'Moletom' | 'Casaco' | 'Short Saia' | 'Calça Legging' | 'Blusa';
export type TipoVenda = 'venda' | 'troca' | 'devolucao';
export type MetodoPagamento = 'PIX' | 'DEBITO' | 'CREDITO_VISTA' | 'CREDITO_PARCELADO' | 'DINHEIRO';
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
  turma: string;
  telefone: string;
  documento: string;
  credito: number;
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
  parcelas?: number;
  itens: VendaItem[];
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
  role: 'Admin' | 'Gerente' | 'Vendedor';
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
  loaded: boolean;
  loadData: () => Promise<void>;
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
  importClientes: (clientes: Omit<Cliente, 'id'>[]) => Promise<{ inseridos: number; duplicados: number }>;
  updateCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  registrarEntrada: (id: string, quantidade: number) => void;
  registrarVenda: (
    itens: ItemSaida[],
    metodoPagamento: MetodoPagamento,
    clienteId?: string,
    clienteNome?: string,
    parcelas?: number,
    creditoUsado?: number
  ) => void;
  registrarTroca: (
    itensEntrada: ItemEntrada[],
    itensSaida: ItemSaida[],
    metodoPagamento: MetodoPagamento,
    clienteId?: string,
    clienteNome?: string,
    parcelas?: number
  ) => void;
  registrarDevolucao: (
    produtoId: string,
    quantidade: number,
    clienteId: string,
    clienteNome: string
  ) => void;
  deleteVenda: (id: string) => void;
  fecharCaixa: (data: string) => void;
  reabrirCaixa: (id: string) => void;
  updateFechamento: (id: string, updates: { operadorId: string; operadorNome: string }) => void;
  deleteFechamento: (id: string) => void;
  isCaixaFechado: (data: string) => boolean;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  tamanhosCustom: string[];
  addTamanhoCustom: (tamanho: string) => void;
  uploadImagem: (file: File) => Promise<string>;
}

const getDateStr = (date: Date) => date.toISOString().split('T')[0];

// Helpers para converter entre camelCase (app) e snake_case (DB)
function dbToProduto(row: any): Produto {
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

function dbToVenda(row: any, itens: VendaItem[]): Venda {
  return {
    id: row.id,
    tipoVenda: row.tipo_venda,
    metodoPagamento: row.metodo_pagamento,
    parcelas: row.parcelas || undefined,
    itens,
    produtoId: row.produto_id || '',
    produtoNome: row.produto_nome || '',
    quantidade: row.quantidade,
    valorTotal: Number(row.valor_total),
    data: row.data,
    vendedorId: row.vendedor_id || '',
    vendedorNome: row.vendedor_nome || '',
    clienteId: row.cliente_id || undefined,
    clienteNome: row.cliente_nome || undefined,
  };
}

function dbToVendaItem(row: any): VendaItem {
  return {
    id: row.id,
    vendaId: row.venda_id,
    tipoItem: row.tipo_item,
    produtoId: row.produto_id || '',
    produtoNome: row.produto_nome || '',
    quantidade: row.quantidade,
    precoUnitario: Number(row.preco_unitario),
    valorTotal: Number(row.valor_total),
  };
}

function dbToFechamento(row: any): FechamentoCaixa {
  return {
    id: row.id,
    data: row.data,
    dataFechamento: row.data_fechamento,
    operadorId: row.operador_id || '',
    operadorNome: row.operador_nome || '',
    totalVendas: Number(row.total_vendas),
    totalTrocas: Number(row.total_trocas),
    quantidadeVendas: row.quantidade_vendas,
    quantidadeTrocas: row.quantidade_trocas,
    totalPix: Number(row.total_pix),
    totalCartao: Number(row.total_cartao),
    totalDinheiro: Number(row.total_dinheiro),
    status: row.status,
  };
}

function dbToDespesa(row: any): Despesa {
  return {
    id: row.id,
    descricao: row.descricao,
    valor: Number(row.valor),
    data: row.data,
    categoria: row.categoria,
  };
}

export const useStore = create<StoreState>((set, get) => ({
  loaded: false,

  loadData: async () => {
    if (!supabase) return;

    const [usuariosRes, produtosRes, clientesRes, vendasRes, itensRes, despesasRes, fechamentosRes] = await Promise.all([
      supabase.from('usuarios').select('*'),
      supabase.from('produtos').select('*'),
      supabase.from('clientes').select('*'),
      supabase.from('vendas').select('*').order('data', { ascending: false }),
      supabase.from('venda_itens').select('*'),
      supabase.from('despesas').select('*').order('data', { ascending: false }),
      supabase.from('fechamentos_caixa').select('*').order('data', { ascending: false }),
    ]);

    const allItens = (itensRes.data || []).map(dbToVendaItem);

    const vendas = (vendasRes.data || []).map(row => {
      const vendaItens = allItens.filter(i => i.vendaId === row.id);
      return dbToVenda(row, vendaItens);
    });

    set({
      loaded: true,
      usuarios: (usuariosRes.data || []).map(u => ({ id: u.id, nome: u.nome, role: u.role, senha: u.senha })),
      produtos: (produtosRes.data || []).map(dbToProduto),
      clientes: (clientesRes.data || []).map(c => ({ id: c.id, nome: c.nome, turma: c.turma || '', telefone: c.telefone || '', documento: c.documento || '', credito: Number(c.credito) || 0 })),
      vendas,
      despesas: (despesasRes.data || []).map(dbToDespesa),
      fechamentosCaixa: (fechamentosRes.data || []).map(dbToFechamento),
    });
  },

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

  usuarios: [],
  usuarioAtivo: null,
  setUsuarioAtivo: (id) => set((state) => ({ usuarioAtivo: state.usuarios.find(u => u.id === id) || state.usuarioAtivo })),

  addUsuario: async (usuario) => {
    if (!supabase) return;
    const { data } = await supabase.from('usuarios').insert({ nome: usuario.nome, role: usuario.role, senha: usuario.senha }).select().single();
    if (data) {
      set(state => ({ usuarios: [...state.usuarios, { id: data.id, nome: data.nome, role: data.role, senha: data.senha }] }));
    }
  },
  updateUsuario: async (id, updates) => {
    if (!supabase) return;
    await supabase.from('usuarios').update(updates).eq('id', id);
    set(state => {
      const updated = state.usuarios.map(u => u.id === id ? { ...u, ...updates } : u);
      const active = state.usuarioAtivo?.id === id ? { ...state.usuarioAtivo, ...updates } : state.usuarioAtivo;
      return { usuarios: updated, usuarioAtivo: active as Usuario };
    });
  },
  deleteUsuario: async (id) => {
    if (!supabase) return;
    await supabase.from('usuarios').delete().eq('id', id);
    set(state => ({
      usuarios: state.usuarios.filter(u => u.id !== id),
      usuarioAtivo: state.usuarioAtivo?.id === id ? state.usuarios.find(u => u.id !== id) || null : state.usuarioAtivo,
    }));
  },

  tamanhosCustom: [],
  addTamanhoCustom: (tamanho) => set(state => ({
    tamanhosCustom: state.tamanhosCustom.includes(tamanho) ? state.tamanhosCustom : [...state.tamanhosCustom, tamanho]
  })),

  produtos: [],
  clientes: [],
  vendas: [],
  despesas: [],
  fechamentosCaixa: [],

  addDespesa: async (despesa) => {
    if (!supabase) return;
    const { data } = await supabase.from('despesas').insert({
      descricao: despesa.descricao,
      valor: despesa.valor,
      data: despesa.data,
      categoria: despesa.categoria,
    }).select().single();
    if (data) {
      set(state => ({ despesas: [...state.despesas, dbToDespesa(data)] }));
    }
  },

  addProduto: async (produto) => {
    if (!supabase) return;
    const { data } = await supabase.from('produtos').insert({
      nome: produto.nome,
      categoria: produto.categoria,
      tamanho: produto.tamanho,
      cor: produto.cor,
      quantidade: produto.quantidade,
      preco_custo: produto.precoCusto,
      preco_venda: produto.precoVenda,
      imagem: produto.imagem || null,
    }).select().single();
    if (data) {
      set(state => ({ produtos: [...state.produtos, dbToProduto(data)] }));
    }
  },

  updateProduto: async (id, updatedFields) => {
    if (!supabase) return;
    const dbFields: any = {};
    if (updatedFields.nome !== undefined) dbFields.nome = updatedFields.nome;
    if (updatedFields.categoria !== undefined) dbFields.categoria = updatedFields.categoria;
    if (updatedFields.tamanho !== undefined) dbFields.tamanho = updatedFields.tamanho;
    if (updatedFields.cor !== undefined) dbFields.cor = updatedFields.cor;
    if (updatedFields.quantidade !== undefined) dbFields.quantidade = updatedFields.quantidade;
    if (updatedFields.precoCusto !== undefined) dbFields.preco_custo = updatedFields.precoCusto;
    if (updatedFields.precoVenda !== undefined) dbFields.preco_venda = updatedFields.precoVenda;
    if (updatedFields.imagem !== undefined) dbFields.imagem = updatedFields.imagem;

    await supabase.from('produtos').update(dbFields).eq('id', id);
    set(state => ({
      produtos: state.produtos.map(p => p.id === id ? { ...p, ...updatedFields } : p),
    }));
  },

  deleteProduto: async (id) => {
    if (!supabase) return;
    await supabase.from('produtos').delete().eq('id', id);
    set(state => ({ produtos: state.produtos.filter(p => p.id !== id) }));
  },

  addCliente: async (cliente) => {
    if (!supabase) return;
    const { data } = await supabase.from('clientes').insert({
      nome: cliente.nome,
      turma: cliente.turma || '',
      telefone: cliente.telefone || '',
      documento: cliente.documento || '',
    }).select().single();
    if (data) {
      set(state => ({ clientes: [...state.clientes, { id: data.id, nome: data.nome, turma: data.turma || '', telefone: data.telefone || '', documento: data.documento || '', credito: 0 }] }));
    }
  },

  importClientes: async (lista) => {
    if (!supabase) return { inseridos: 0, duplicados: 0 };
    const existentes = get().clientes;
    const nomesExistentes = new Set(existentes.map(c => c.nome.toLowerCase().trim()));

    const novos = lista.filter(c => !nomesExistentes.has(c.nome.toLowerCase().trim()));
    const duplicados = lista.length - novos.length;

    if (novos.length === 0) return { inseridos: 0, duplicados };

    const rows = novos.map(c => ({
      nome: c.nome.trim(),
      turma: c.turma?.trim() || '',
      telefone: c.telefone?.trim() || '',
      documento: c.documento?.trim() || '',
    }));

    const { data } = await supabase.from('clientes').insert(rows).select();
    if (data) {
      const novosClientes = data.map((c: any) => ({ id: c.id, nome: c.nome, turma: c.turma || '', telefone: c.telefone || '', documento: c.documento || '', credito: 0 }));
      set(state => ({ clientes: [...state.clientes, ...novosClientes] }));
    }

    return { inseridos: data?.length || 0, duplicados };
  },

  updateCliente: async (id, updatedFields) => {
    if (!supabase) return;
    await supabase.from('clientes').update(updatedFields).eq('id', id);
    set(state => ({
      clientes: state.clientes.map(c => c.id === id ? { ...c, ...updatedFields } : c),
    }));
  },

  deleteCliente: async (id) => {
    if (!supabase) return;
    await supabase.from('clientes').delete().eq('id', id);
    set(state => ({ clientes: state.clientes.filter(c => c.id !== id) }));
  },

  registrarEntrada: async (id, qtd) => {
    if (!supabase) return;
    const produto = get().produtos.find(p => p.id === id);
    if (!produto) return;
    const novaQtd = produto.quantidade + qtd;
    await supabase.from('produtos').update({ quantidade: novaQtd }).eq('id', id);
    set(state => ({
      produtos: state.produtos.map(p => p.id === id ? { ...p, quantidade: novaQtd } : p),
    }));
  },

  registrarVenda: async (itens, metodoPagamento, clienteId, clienteNome, parcelas, creditoUsado) => {
    if (!supabase) return;
    const vendedor = get().usuarioAtivo;
    if (!vendedor || itens.length === 0) return;

    const hoje = getDateStr(new Date());
    if (get().isCaixaFechado(hoje)) return;

    const state = get();
    const primeiroProduto = state.produtos.find(p => p.id === itens[0].produtoId);
    const totalGeral = itens.reduce((acc, item) => acc + item.valorTotal, 0);

    // Inserir venda
    const { data: vendaRow } = await supabase.from('vendas').insert({
      tipo_venda: 'venda',
      metodo_pagamento: metodoPagamento,
      parcelas: parcelas || null,
      produto_id: itens[0].produtoId,
      produto_nome: primeiroProduto?.nome || 'Produto removido',
      quantidade: itens.reduce((acc, item) => acc + item.quantidade, 0),
      valor_total: totalGeral,
      data: new Date().toISOString(),
      vendedor_id: vendedor.id,
      vendedor_nome: vendedor.nome,
      cliente_id: clienteId || null,
      cliente_nome: clienteNome || null,
    }).select().single();

    if (!vendaRow) return;

    // Inserir itens da venda
    const itensToInsert = itens.map(item => {
      const produto = state.produtos.find(p => p.id === item.produtoId);
      return {
        venda_id: vendaRow.id,
        tipo_item: 'saida',
        produto_id: item.produtoId,
        produto_nome: produto?.nome || 'Produto removido',
        quantidade: item.quantidade,
        preco_unitario: produto ? item.valorTotal / item.quantidade : 0,
        valor_total: item.valorTotal,
      };
    });
    const { data: itensRows } = await supabase.from('venda_itens').insert(itensToInsert).select();

    // Atualizar estoque no banco
    for (const item of itens) {
      const produto = state.produtos.find(p => p.id === item.produtoId);
      if (produto) {
        const novaQtd = Math.max(0, produto.quantidade - item.quantidade);
        await supabase.from('produtos').update({ quantidade: novaQtd }).eq('id', item.produtoId);
      }
    }

    // Deduct credit from client if used
    let novoClientes = state.clientes;
    if (creditoUsado && creditoUsado > 0 && clienteId) {
      const cliente = state.clientes.find(c => c.id === clienteId);
      if (cliente) {
        const novoCredito = Math.max(0, cliente.credito - creditoUsado);
        await supabase.from('clientes').update({ credito: novoCredito }).eq('id', clienteId);
        novoClientes = state.clientes.map(c => c.id === clienteId ? { ...c, credito: novoCredito } : c);
      }
    }

    // Atualizar state local
    const vendaItens: VendaItem[] = (itensRows || []).map(dbToVendaItem);
    const novaVenda = dbToVenda(vendaRow, vendaItens);
    const novoProdutos = state.produtos.map(p => {
      const itemVenda = itens.find(i => i.produtoId === p.id);
      if (itemVenda) return { ...p, quantidade: Math.max(0, p.quantidade - itemVenda.quantidade) };
      return p;
    });

    set({ produtos: novoProdutos, clientes: novoClientes, vendas: [novaVenda, ...state.vendas] });
  },

  registrarTroca: async (itensEntrada, itensSaida, metodoPagamento, clienteId, clienteNome, parcelas) => {
    if (!supabase) return;
    const vendedor = get().usuarioAtivo;
    if (!vendedor) return;
    if (itensSaida.length === 0 && itensEntrada.length === 0) return;

    const hoje = getDateStr(new Date());
    if (get().isCaixaFechado(hoje)) return;

    const state = get();
    const totalSaida = itensSaida.reduce((acc, item) => acc + item.valorTotal, 0);
    const totalEntrada = itensEntrada.reduce((acc, item) => acc + item.valorTotal, 0);
    const diferenca = totalSaida - totalEntrada;

    const primeiroProdutoSaida = itensSaida.length > 0
      ? state.produtos.find(p => p.id === itensSaida[0].produtoId)
      : null;

    // Inserir venda (troca)
    const { data: vendaRow } = await supabase.from('vendas').insert({
      tipo_venda: 'troca',
      metodo_pagamento: metodoPagamento,
      parcelas: parcelas || null,
      produto_id: itensSaida[0]?.produtoId || itensEntrada[0]?.produtoId || '',
      produto_nome: primeiroProdutoSaida?.nome || itensEntrada[0]?.produtoNome || 'Troca',
      quantidade: itensSaida.reduce((acc, item) => acc + item.quantidade, 0),
      valor_total: diferenca,
      data: new Date().toISOString(),
      vendedor_id: vendedor.id,
      vendedor_nome: vendedor.nome,
      cliente_id: clienteId || null,
      cliente_nome: clienteNome || null,
    }).select().single();

    if (!vendaRow) return;

    // Inserir itens
    const allItensToInsert = [
      ...itensEntrada.map(item => ({
        venda_id: vendaRow.id,
        tipo_item: 'entrada',
        produto_id: item.produtoId,
        produto_nome: item.produtoNome,
        quantidade: item.quantidade,
        preco_unitario: item.precoUnitario,
        valor_total: item.valorTotal,
      })),
      ...itensSaida.map(item => {
        const produto = state.produtos.find(p => p.id === item.produtoId);
        return {
          venda_id: vendaRow.id,
          tipo_item: 'saida',
          produto_id: item.produtoId,
          produto_nome: produto?.nome || 'Produto removido',
          quantidade: item.quantidade,
          preco_unitario: produto ? item.valorTotal / item.quantidade : 0,
          valor_total: item.valorTotal,
        };
      }),
    ];
    const { data: itensRows } = await supabase.from('venda_itens').insert(allItensToInsert).select();

    // Atualizar estoque
    for (const item of itensEntrada) {
      const produto = state.produtos.find(p => p.id === item.produtoId);
      if (produto) {
        await supabase.from('produtos').update({ quantidade: produto.quantidade + item.quantidade }).eq('id', item.produtoId);
      }
    }
    for (const item of itensSaida) {
      const produto = state.produtos.find(p => p.id === item.produtoId);
      if (produto) {
        await supabase.from('produtos').update({ quantidade: Math.max(0, produto.quantidade - item.quantidade) }).eq('id', item.produtoId);
      }
    }

    // Atualizar state local
    const vendaItens: VendaItem[] = (itensRows || []).map(dbToVendaItem);
    const novaVenda = dbToVenda(vendaRow, vendaItens);
    const novoProdutos = state.produtos.map(p => {
      const itemEntrada = itensEntrada.find(i => i.produtoId === p.id);
      const itemSaida = itensSaida.find(i => i.produtoId === p.id);
      let novaQtd = p.quantidade;
      if (itemEntrada) novaQtd += itemEntrada.quantidade;
      if (itemSaida) novaQtd = Math.max(0, novaQtd - itemSaida.quantidade);
      return { ...p, quantidade: novaQtd };
    });

    set({ produtos: novoProdutos, vendas: [novaVenda, ...state.vendas] });
  },

  registrarDevolucao: async (produtoId, quantidade, clienteId, clienteNome) => {
    if (!supabase) return;
    const vendedor = get().usuarioAtivo;
    if (!vendedor) return;

    const state = get();
    const produto = state.produtos.find(p => p.id === produtoId);
    if (!produto) return;

    const valorCredito = produto.precoVenda * quantidade;

    // Insert venda record as devolucao
    const { data: vendaRow } = await supabase.from('vendas').insert({
      tipo_venda: 'devolucao',
      metodo_pagamento: 'DINHEIRO',
      produto_id: produtoId,
      produto_nome: produto.nome,
      quantidade,
      valor_total: -valorCredito,
      data: new Date().toISOString(),
      vendedor_id: vendedor.id,
      vendedor_nome: vendedor.nome,
      cliente_id: clienteId,
      cliente_nome: clienteNome,
    }).select().single();

    if (!vendaRow) return;

    // Insert venda_itens
    const { data: itensRows } = await supabase.from('venda_itens').insert({
      venda_id: vendaRow.id,
      tipo_item: 'entrada',
      produto_id: produtoId,
      produto_nome: `${produto.nome} (${produto.tamanho})`,
      quantidade,
      preco_unitario: produto.precoVenda,
      valor_total: valorCredito,
    }).select();

    // Return product to stock
    const novaQtd = produto.quantidade + quantidade;
    await supabase.from('produtos').update({ quantidade: novaQtd }).eq('id', produtoId);

    // Add credit to client
    const cliente = state.clientes.find(c => c.id === clienteId);
    const novoCredito = (cliente?.credito || 0) + valorCredito;
    await supabase.from('clientes').update({ credito: novoCredito }).eq('id', clienteId);

    // Update local state
    const vendaItens: VendaItem[] = (itensRows || []).map(dbToVendaItem);
    const novaVenda = dbToVenda(vendaRow, vendaItens);

    set({
      produtos: state.produtos.map(p => p.id === produtoId ? { ...p, quantidade: novaQtd } : p),
      clientes: state.clientes.map(c => c.id === clienteId ? { ...c, credito: novoCredito } : c),
      vendas: [novaVenda, ...state.vendas],
    });
  },

  deleteVenda: async (id) => {
    if (!supabase) return;
    const usuario = get().usuarioAtivo;
    if (!usuario || (usuario.role !== 'Admin' && usuario.role !== 'Gerente')) return;

    const state = get();
    const venda = state.vendas.find(v => v.id === id);
    if (!venda) return;

    // Check if day is closed
    const dataVenda = getDateStr(new Date(venda.data));
    if (get().isCaixaFechado(dataVenda)) return;

    // Revert stock based on sale items
    for (const item of venda.itens) {
      const produto = state.produtos.find(p => p.id === item.produtoId);
      if (produto) {
        if (item.tipoItem === 'saida') {
          // Was sold, add back to stock
          await supabase.from('produtos').update({ quantidade: produto.quantidade + item.quantidade }).eq('id', item.produtoId);
        } else if (item.tipoItem === 'entrada') {
          // Was returned, remove from stock
          const novaQtd = Math.max(0, produto.quantidade - item.quantidade);
          await supabase.from('produtos').update({ quantidade: novaQtd }).eq('id', item.produtoId);
        }
      }
    }

    // Delete venda (venda_itens cascade)
    await supabase.from('vendas').delete().eq('id', id);

    // Update local state
    const novoProdutos = state.produtos.map(p => {
      const itemSaida = venda.itens.find(i => i.produtoId === p.id && i.tipoItem === 'saida');
      const itemEntrada = venda.itens.find(i => i.produtoId === p.id && i.tipoItem === 'entrada');
      let novaQtd = p.quantidade;
      if (itemSaida) novaQtd += itemSaida.quantidade;
      if (itemEntrada) novaQtd = Math.max(0, novaQtd - itemEntrada.quantidade);
      return { ...p, quantidade: novaQtd };
    });

    set({
      vendas: state.vendas.filter(v => v.id !== id),
      produtos: novoProdutos,
    });
  },

  fecharCaixa: async (data) => {
    if (!supabase) return;
    const vendedor = get().usuarioAtivo;
    if (!vendedor) return;

    const state = get();
    const jaFechado = state.fechamentosCaixa.find(f => f.data === data && f.status === 'fechado');
    if (jaFechado) return;

    const vendasDoDia = state.vendas.filter(v => getDateStr(new Date(v.data)) === data);
    const vendas = vendasDoDia.filter(v => v.tipoVenda === 'venda');
    const trocas = vendasDoDia.filter(v => v.tipoVenda === 'troca');

    const totalVendas = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    const totalTrocas = trocas.reduce((acc, v) => acc + v.valorTotal, 0);
    const totalPix = vendasDoDia.filter(v => v.metodoPagamento === 'PIX').reduce((acc, v) => acc + v.valorTotal, 0);
    const totalCartao = vendasDoDia.filter(v => ['DEBITO', 'CREDITO_VISTA', 'CREDITO_PARCELADO'].includes(v.metodoPagamento) || (v.metodoPagamento as string) === 'CARTAO').reduce((acc, v) => acc + v.valorTotal, 0);
    const totalDinheiro = vendasDoDia.filter(v => v.metodoPagamento === 'DINHEIRO').reduce((acc, v) => acc + v.valorTotal, 0);

    // Verificar se existe um fechamento reaberto para substituir
    const existente = state.fechamentosCaixa.find(f => f.data === data);

    if (existente) {
      await supabase.from('fechamentos_caixa').update({
        data_fechamento: new Date().toISOString(),
        operador_id: vendedor.id,
        operador_nome: vendedor.nome,
        total_vendas: totalVendas,
        total_trocas: totalTrocas,
        quantidade_vendas: vendas.length,
        quantidade_trocas: trocas.length,
        total_pix: totalPix,
        total_cartao: totalCartao,
        total_dinheiro: totalDinheiro,
        status: 'fechado',
      }).eq('id', existente.id);

      const fechamento: FechamentoCaixa = {
        ...existente,
        dataFechamento: new Date().toISOString(),
        operadorId: vendedor.id,
        operadorNome: vendedor.nome,
        totalVendas, totalTrocas,
        quantidadeVendas: vendas.length, quantidadeTrocas: trocas.length,
        totalPix, totalCartao, totalDinheiro,
        status: 'fechado',
      };
      set({ fechamentosCaixa: state.fechamentosCaixa.map(f => f.id === existente.id ? fechamento : f) });
    } else {
      const { data: row } = await supabase.from('fechamentos_caixa').insert({
        data,
        data_fechamento: new Date().toISOString(),
        operador_id: vendedor.id,
        operador_nome: vendedor.nome,
        total_vendas: totalVendas,
        total_trocas: totalTrocas,
        quantidade_vendas: vendas.length,
        quantidade_trocas: trocas.length,
        total_pix: totalPix,
        total_cartao: totalCartao,
        total_dinheiro: totalDinheiro,
        status: 'fechado',
      }).select().single();

      if (row) {
        set({ fechamentosCaixa: [...state.fechamentosCaixa, dbToFechamento(row)] });
      }
    }
  },

  reabrirCaixa: async (id) => {
    if (!supabase) return;
    const usuario = get().usuarioAtivo;
    if (!usuario || (usuario.role !== 'Admin' && usuario.role !== 'Gerente')) return;

    await supabase.from('fechamentos_caixa').update({ status: 'reaberto' }).eq('id', id);
    set(state => ({
      fechamentosCaixa: state.fechamentosCaixa.map(f =>
        f.id === id ? { ...f, status: 'reaberto' as const } : f
      ),
    }));
  },

  updateFechamento: async (id, updates) => {
    if (!supabase) return;
    await supabase.from('fechamentos_caixa').update({
      operador_id: updates.operadorId,
      operador_nome: updates.operadorNome,
    }).eq('id', id);
    set(state => ({
      fechamentosCaixa: state.fechamentosCaixa.map(f =>
        f.id === id ? { ...f, operadorId: updates.operadorId, operadorNome: updates.operadorNome } : f
      ),
    }));
  },

  deleteFechamento: async (id) => {
    if (!supabase) return;
    await supabase.from('fechamentos_caixa').delete().eq('id', id);
    set(state => ({
      fechamentosCaixa: state.fechamentosCaixa.filter(f => f.id !== id),
    }));
  },

  isCaixaFechado: (data) => {
    const state = get();
    return state.fechamentosCaixa.some(f => f.data === data && f.status === 'fechado');
  },

  uploadImagem: async (file: File) => {
    if (!supabase) return URL.createObjectURL(file);

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('produtos').upload(fileName, file);

    if (error || !data) {
      console.error('Erro upload:', error);
      return URL.createObjectURL(file);
    }

    const { data: urlData } = supabase.storage.from('produtos').getPublicUrl(data.path);
    return urlData.publicUrl;
  },
}));
