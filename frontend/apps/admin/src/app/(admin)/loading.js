import Spinner from '@tithi/ui/Spinner';

export default function AdminLoading() {
  return (
    <div className="loader-theme-bg grid min-h-[70vh] place-items-center px-4" aria-label="Loading admin page">
      <div className="flex min-w-44 flex-col items-center gap-3 text-center text-sm font-bold text-orange-600">
        <Spinner size="lg" />
        Loading admin page...
      </div>
    </div>
  );
}
