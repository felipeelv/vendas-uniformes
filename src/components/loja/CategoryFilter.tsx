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
    <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:gap-0">
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
            className={`shrink-0 px-4 sm:px-5 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
              isActive
                ? 'text-eleve-teal-dark border-eleve-teal font-bold'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
