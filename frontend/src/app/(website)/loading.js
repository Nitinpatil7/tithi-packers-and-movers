import Spinner from '@/components/ui/Spinner';

export default function WebsiteLoading() {
  return (
    <div className="grid min-h-[72vh] place-items-center bg-[#ff4f1f] px-4">
      <div className="flex min-w-44 flex-col items-center gap-3 text-center text-sm font-bold text-white/90">
        <Spinner size="lg" />
        Loading page...
      </div>
    </div>
  );
}
