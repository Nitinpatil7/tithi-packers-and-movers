import Spinner from '@ui/Spinner';

export default function RootLoading() {
  return (
    <div className="loader-theme-bg grid min-h-[72vh] place-items-center px-4">
      <div className="flex min-w-44 flex-col items-center gap-3 text-center text-sm font-bold text-orange-600">
        <Spinner size="lg" />
        Loading page...
      </div>
    </div>
  );
}
