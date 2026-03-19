import { useState } from 'react';
import { User, Phone, School, ChevronLeft, ShieldCheck, ImageOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { Produto } from '../../store/useStore';

interface CartItem {
  produto: Produto;
  qtd: number;
}

interface CheckoutFormProps {
  formData: { nome: string; telefone: string; aluno: string };
  onFormChange: (data: { nome: string; telefone: string; aluno: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  items: CartItem[];
  totalVenda: number;
  formatBRL: (v: number) => string;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateField(field: string, value: string): { valid: boolean; message?: string } {
  if (!value.trim()) return { valid: false };
  switch (field) {
    case 'nome':
      if (value.trim().length < 3) return { valid: false, message: 'Mínimo 3 caracteres' };
      if (!value.trim().includes(' ')) return { valid: false, message: 'Informe nome e sobrenome' };
      return { valid: true };
    case 'telefone': {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10) return { valid: false, message: 'Telefone incompleto' };
      return { valid: true };
    }
    case 'aluno':
      if (value.trim().length < 2) return { valid: false, message: 'Mínimo 2 caracteres' };
      return { valid: true };
    default:
      return { valid: true };
  }
}

export default function CheckoutForm({
  formData,
  onFormChange,
  onSubmit,
  onBack,
  items,
  totalVenda,
  formatBRL,
}: CheckoutFormProps) {
  const totalPecas = items.reduce((acc, item) => acc + item.qtd, 0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const nomeVal = validateField('nome', formData.nome);
  const telVal = validateField('telefone', formData.telefone);
  const alunoVal = validateField('aluno', formData.aluno);
  const allValid = nomeVal.valid && telVal.valid && alunoVal.valid;

  const handlePhoneChange = (val: string) => {
    onFormChange({ ...formData, telefone: formatPhone(val) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nome: true, telefone: true, aluno: true });
    if (!allValid) return;
    setSubmitting(true);
    await onSubmit(e);
    setSubmitting(false);
  };

  const fieldClass = (field: string, validation: { valid: boolean; message?: string }) => {
    const base = 'w-full px-4 py-3.5 border rounded-xl outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400';
    if (!touched[field] || !formData[field as keyof typeof formData]) {
      return `${base} bg-slate-50 border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`;
    }
    if (validation.valid) {
      return `${base} bg-emerald-50/50 border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`;
    }
    return `${base} bg-red-50/50 border-red-300 focus:ring-2 focus:ring-red-400 focus:border-red-400`;
  };

  const renderFieldFeedback = (field: string, validation: { valid: boolean; message?: string }) => {
    if (!touched[field] || !formData[field as keyof typeof formData]) return null;
    if (validation.valid) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1.5">
          <CheckCircle2 className="w-3 h-3" /> OK
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1.5">
        <AlertCircle className="w-3 h-3" /> {validation.message}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Finalizar Compra</h1>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">{totalPecas} {totalPecas === 1 ? 'item' : 'itens'}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form - Left */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Dados para o Pedido
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nome do Responsável
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Nome completo de quem vai pagar"
                    value={formData.nome}
                    onChange={(e) => onFormChange({ ...formData, nome: e.target.value })}
                    onBlur={() => setTouched(t => ({ ...t, nome: true }))}
                    className={fieldClass('nome', nomeVal)}
                  />
                  {renderFieldFeedback('nome', nomeVal)}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="tel"
                      placeholder="(11) 90000-0000"
                      value={formData.telefone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, telefone: true }))}
                      className={`pl-11 pr-4 ${fieldClass('telefone', telVal)}`}
                    />
                  </div>
                  {renderFieldFeedback('telefone', telVal)}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nome do Aluno(a)
                  </label>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="Nome do estudante que usará a peça"
                      value={formData.aluno}
                      onChange={(e) => onFormChange({ ...formData, aluno: e.target.value })}
                      onBlur={() => setTouched(t => ({ ...t, aluno: true }))}
                      className={`pl-11 pr-4 ${fieldClass('aluno', alunoVal)}`}
                    />
                  </div>
                  {renderFieldFeedback('aluno', alunoVal)}
                </div>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium px-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              Seus dados são usados apenas para identificar o pedido.
            </div>

            {/* Submit - Mobile */}
            <button
              type="submit"
              disabled={submitting}
              className={`lg:hidden w-full py-4 rounded-xl font-bold text-base text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                allValid
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
              ) : (
                <>Confirmar Pedido — {formatBRL(totalVenda)}</>
              )}
            </button>
          </form>

          {/* Order Summary - Right */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-24 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 mb-5">
                {items.map(({ produto, qtd }) => (
                  <div key={produto.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                      {produto.imagem ? (
                        <img src={produto.imagem} className="w-full h-full object-cover" alt={produto.nome} />
                      ) : (
                        <ImageOff className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {produto.nome}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Tam: {produto.tamanho} · Qtd: {qtd}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-700 shrink-0">
                      {formatBRL(produto.precoVenda * qtd)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal ({totalPecas} itens)</span>
                  <span className="font-semibold text-slate-700">{formatBRL(totalVenda)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Entrega</span>
                  <span className="font-semibold text-emerald-600">Grátis na escola</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-black text-slate-900">{formatBRL(totalVenda)}</span>
                </div>
              </div>

              {/* Submit - Desktop */}
              <button
                onClick={(e) => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                  e.preventDefault();
                }}
                disabled={submitting}
                className={`hidden lg:flex w-full mt-5 py-4 rounded-xl font-bold text-base text-white transition-all items-center justify-center gap-2 ${
                  allValid
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-slate-300 cursor-not-allowed shadow-none'
                }`}
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                ) : (
                  'Confirmar Pedido'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
