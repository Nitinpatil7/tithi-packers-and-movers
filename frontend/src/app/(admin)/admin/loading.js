import Spinner from '@/components/ui/Spinner';

export default function AdminLoading() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-[#ff4f1f] px-4" aria-label="Loading admin page">
      <div className="flex min-w-44 flex-col items-center gap-3 text-center text-sm font-bold text-white/90">
        <Spinner size="lg" />
        Loading admin page...
      </div>
    </div>
  );
}
