export default function AdminLoading() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-transparent px-4" aria-label="Loading admin page">
      <div className="flex min-w-44 flex-col items-center gap-3 rounded-2xl border border-sky-100 bg-white/95 px-6 py-5 text-center text-sm font-bold text-sky-700 shadow-sm">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        Loading admin page...
      </div>
    </div>
  );
}
