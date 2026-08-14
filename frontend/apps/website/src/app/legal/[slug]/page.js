'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import { usePublishedLegalPage } from '@hooks/useLegalPages';

export default function LegalPage({ params }) {
  const { data: page, isLoading, isError, refetch } = usePublishedLegalPage(params.slug);

  return (
    <main className="min-h-screen bg-bg-page px-4 pb-20 pt-28 text-text-primary">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80"><ArrowLeft className="h-4 w-4" /> Back to website</Link>
        {isLoading ? <div className="h-96 animate-pulse rounded-3xl border border-bg-border bg-bg-white" /> : isError || !page ? (
          <div className="rounded-3xl border border-bg-border bg-bg-white p-10 text-center"><FileText className="mx-auto h-10 w-10 text-text-tertiary" /><h1 className="mt-4 text-2xl font-black">Page is not available</h1><p className="mt-2 text-sm text-text-secondary">This legal page may not be published yet.</p><button onClick={() => refetch()} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Try again</button></div>
        ) : (
          <article className="overflow-hidden rounded-3xl border border-bg-border bg-bg-white shadow-card">
            <header className="border-b border-bg-border bg-primary-soft px-6 py-9 sm:px-10"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><ShieldCheck className="h-4 w-4" /> Legal information</span><h1 className="mt-3 text-3xl font-black sm:text-4xl">{page.title}</h1>{page.updatedAt && <p className="mt-3 text-xs font-semibold text-text-secondary">Last updated {new Date(page.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}</header>
            <div className="legal-content px-6 py-9 sm:px-10" dangerouslySetInnerHTML={{ __html: page.content }} />
          </article>
        )}
      </div>
    </main>
  );
}
