import Spinner from '@tithi/ui/Spinner';

export default function AdminLoading() {
  return (
    <div className="loader-theme-bg grid min-h-[70vh] place-items-center px-4" aria-label="Loading admin page">
      <Spinner size="lg" />
    </div>
  );
}
