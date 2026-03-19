import type { Categoria } from '../../store/useStore';

const CATEGORIAS: { label: string; value: Categoria | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Camisetas', value: 'Camiseta' },
  { label: 'Calças', value: 'Calça' },
  { label: 'Bermudas', value: 'Bermuda' },
  { label: 'Moletons', value: 'Moletom' },
  { label: 'Casacos', value: 'Casaco' },
];

interface CategoryFilterProps {
  selected: Categoria | 'all';
  onChange: (cat: Categoria | 'all') => void;
  counts: Record<string, number>;
}

export default function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {CATEGORIAS.map(({ label, value }) => {
        const count = value === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[value] || 0);

        if (value !== 'all' && count === 0) return null;

        const isActive = selected === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {label}
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
              isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
