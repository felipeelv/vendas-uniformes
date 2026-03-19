export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[4/5] bg-slate-100" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3 w-16 bg-slate-100 rounded-full" />
        <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
        <div className="h-4 w-1/2 bg-slate-100 rounded-full mt-2" />
        <div className="flex justify-between mt-1">
          <div className="h-6 w-20 bg-slate-100 rounded-lg" />
          <div className="h-5 w-14 bg-slate-50 rounded-md" />
        </div>
      </div>
    </div>
  );
}
