import { CheckCircle2, Phone, ShoppingBag, PartyPopper } from 'lucide-react';

interface SuccessScreenProps {
  formData: { nome: string; telefone: string; aluno: string };
  totalVenda: number;
  formatBRL: (v: number) => string;
  onWhatsApp: () => void;
  onContinueShopping: () => void;
}

export default function SuccessScreen({
  formData,
  totalVenda,
  formatBRL,
  onWhatsApp,
  onContinueShopping,
}: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f7f6] to-white flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-eleve-teal/10 border border-eleve-teal/20 max-w-md w-full text-center">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-eleve-teal/15 rounded-full animate-ping opacity-20" />
          <div className="relative w-24 h-24 bg-eleve-teal/15 text-eleve-teal-dark rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="absolute -top-2 -right-2">
            <PartyPopper className="w-8 h-8 text-eleve-gold" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          Pedido Recebido!
        </h1>
        <p className="text-slate-500 mb-6 text-sm sm:text-base leading-relaxed">
          {formData.nome}, seu pedido de{' '}
          <strong className="text-slate-700">{formatBRL(totalVenda)}</strong>{' '}
          foi registrado. Confirme via WhatsApp para concluir.
        </p>

        {/* Order info */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-medium">Responsável</span>
            <span className="font-semibold text-slate-700">{formData.nome}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-medium">Aluno(a)</span>
            <span className="font-semibold text-slate-700">{formData.aluno}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
            <span className="text-slate-400 font-medium">Total</span>
            <span className="font-black text-eleve-teal-dark">{formatBRL(totalVenda)}</span>
          </div>
        </div>

        <button
          onClick={onWhatsApp}
          className="w-full bg-eleve-teal hover:bg-eleve-teal-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-eleve-teal/20 mb-3 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-base"
        >
          <Phone className="w-5 h-5" />
          Confirmar no WhatsApp
        </button>

        <button
          onClick={onContinueShopping}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Continuar Comprando
        </button>
      </div>
    </div>
  );
}
