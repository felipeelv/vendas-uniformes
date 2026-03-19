import { ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-30 w-11 h-11 bg-white border border-slate-200 rounded-full shadow-lg shadow-slate-200/50 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all"
      aria-label="Voltar ao topo"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
