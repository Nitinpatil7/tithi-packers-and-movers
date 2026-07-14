import Spinner from '@/components/ui/Spinner';

export default function WebsiteLoading() {
  return (
    <div className="grid min-h-[72vh] place-items-center bg-bg-page px-4">
      <div className="flex min-w-44 flex-col items-center gap-3 rounded-2xl border border-bg-border bg-bg-white/90 px-6 py-5 text-center text-sm font-semibold text-text-secondary shadow-card">
        <Spinner size="lg" />
        Loading page...
      </div>
    </div>
  );
}
