import Spinner from '@tithi/ui/Spinner';

export default function RootLoading() {
  return (
    <div className="loader-theme-bg grid min-h-[72vh] place-items-center px-4">
      <Spinner size="lg" />
    </div>
  );
}
