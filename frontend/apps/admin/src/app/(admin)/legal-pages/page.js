'use client';

import { useMemo, useState } from 'react';
import { Edit3, Eye, EyeOff, FilePlus2, FileText, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@ui/Modal';
import { useCreateLegalPage, useLegalPages, useUnpublishLegalPage, useUpdateLegalPage } from '@hooks/useLegalPages';
import AdminStatGrid from '@/components/admin/AdminStatGrid';

const TYPES = [
  { value: 'privacy_policy', label: 'Privacy Policy', slug: 'privacy-policy' },
  { value: 'terms_conditions', label: 'Terms & Conditions', slug: 'terms-conditions' },
  { value: 'refund_policy', label: 'Refund Policy', slug: 'refund-policy' },
  { value: 'cancellation_policy', label: 'Cancellation Policy', slug: 'cancellation-policy' },
];
const emptyForm = { type: 'privacy_policy', title: 'Privacy Policy', slug: 'privacy-policy', content: '', isPublished: true };

export default function LegalPagesAdmin() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { data = [], isLoading, isError, refetch } = useLegalPages({ isPublished: status });
  const createMutation = useCreateLegalPage();
  const updateMutation = useUpdateLegalPage();
  const unpublishMutation = useUnpublishLegalPage();
  const pages = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const filtered = useMemo(() => pages.filter((page) => `${page.title} ${page.slug} ${page.type}`.toLowerCase().includes(search.toLowerCase())), [pages, search]);
  const usedTypes = new Set(pages.map((page) => page.type));
  const missingTypes = TYPES.filter((type) => !usedTypes.has(type.value));

  const openCreate = (preset = missingTypes[0] || TYPES[0]) => {
    setEditing(null);
    setForm({ type: preset.value, title: preset.label, slug: preset.slug, content: `<h2>${preset.label}</h2>\n<p>Write the policy content here.</p>`, isPublished: true });
    setOpen(true);
  };
  const openEdit = (page) => {
    setEditing(page);
    setForm({ type: page.type, title: page.title, slug: page.slug, content: page.content, isPublished: page.isPublished !== false });
    setOpen(true);
  };
  const changeType = (type) => {
    const preset = TYPES.find((item) => item.value === type);
    setForm((current) => ({ ...current, type, title: preset.label, slug: preset.slug }));
  };
  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing._id, data: form });
      else await createMutation.mutateAsync(form);
      toast.success(editing ? 'Legal page updated' : 'Legal page created');
      setOpen(false);
    } catch (error) { toast.error(error.message); }
  };
  const unpublish = async (page) => {
    if (!window.confirm(`Unpublish “${page.title}”? The public link will stop working.`)) return;
    try { await unpublishMutation.mutateAsync(page._id); toast.success('Page unpublished'); }
    catch (error) { toast.error(error.message); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Website governance</p><h1 className="mt-1 text-2xl font-black text-slate-900">Legal Pages</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Create each policy once, then keep it current. Unpublish safely without permanently deleting content.</p></div><button onClick={() => openCreate()} disabled={!missingTypes.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"><Plus className="h-4 w-4" /> {missingTypes.length ? 'Add legal page' : 'All page types created'}</button></header>

    <AdminStatGrid><Stat label="Configured" value={`${pages.length}/4`} icon={FileText} /><Stat label="Published" value={pages.filter((page) => page.isPublished !== false).length} icon={Eye} green /><Stat label="Still to create" value={Math.max(0, 4 - usedTypes.size)} icon={FilePlus2} /></AdminStatGrid>

    {missingTypes.length > 0 && <section className="rounded-2xl border border-dashed border-sky-200 bg-white p-5"><p className="text-sm font-bold text-slate-800">Pages still required</p><div className="mt-3 flex flex-wrap gap-2">{missingTypes.map((type) => <button key={type.value} onClick={() => openCreate(type)} className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100"><Plus className="h-3.5 w-3.5" /> {type.label}</button>)}</div></section>}

    <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-sky-100 p-4 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, type or slug..." className="w-full rounded-xl border border-sky-100 bg-sky-50/60 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400" /></label><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"><option value="">All statuses</option><option value="true">Published</option><option value="false">Unpublished</option></select></div>
      {isLoading ? <div className="p-12 text-center text-sm text-slate-500">Loading legal pages...</div> : isError ? <div className="p-12 text-center"><p className="text-sm text-red-500">Could not load legal pages.</p><button onClick={() => refetch()} className="mt-3 text-sm font-bold text-sky-600">Try again</button></div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No legal pages match this view.</div> : <div className="divide-y divide-sky-50">{filtered.map((page) => <div key={page._id} className="flex flex-col gap-4 p-5 hover:bg-sky-50/40 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sky-100 text-sky-600"><ShieldCheck className="h-5 w-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-900">{page.title}</h2><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${page.isPublished === false ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>{page.isPublished === false ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{page.isPublished === false ? 'Unpublished' : 'Published'}</span></div><p className="mt-1 text-xs font-semibold text-slate-400">/{page.slug} · {page.type}</p><p className="mt-2 line-clamp-1 text-sm text-slate-500">{page.content?.replace(/<[^>]+>/g, ' ')}</p></div></div><div className="flex gap-2 pl-15 lg:pl-0"><button onClick={() => openEdit(page)} className="rounded-xl border border-sky-100 p-2.5 text-sky-600 hover:bg-sky-50" aria-label={`Edit ${page.title}`}><Edit3 className="h-4 w-4" /></button><button onClick={() => unpublish(page)} disabled={page.isPublished === false || unpublishMutation.isPending} className="rounded-xl border border-red-100 p-2.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Unpublish ${page.title}`}><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}
    </section>

    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Update legal page' : 'Create legal page'} size="lg"><form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Page type"><select value={form.type} onChange={(e) => changeType(e.target.value)} disabled={Boolean(editing)} className="admin-field">{TYPES.map((type) => <option key={type.value} value={type.value} disabled={!editing && usedTypes.has(type.value)}>{type.label}</option>)}</select></Field><Field label="Published"><select value={String(form.isPublished)} onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'true' })} className="admin-field"><option value="true">Published</option><option value="false">Draft / unpublished</option></select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-field" /></Field><Field label="Slug"><input required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} className="admin-field" /></Field></div><Field label="HTML content"><textarea required rows={13} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="admin-field resize-y font-mono text-xs" placeholder="<h2>Heading</h2><p>Policy details...</p>" /><span className="mt-1 block text-xs text-slate-400">HTML is supported so headings, paragraphs and lists render correctly on the website.</span></Field><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancel</button><button disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{editing ? 'Save changes' : 'Create page'}</button></div></form></Modal>
  </div>;
}

function Stat({ label, value, icon: Icon, green }) { return <div className="admin-summary-card rounded-2xl border border-sky-100 bg-white p-3 sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase leading-tight text-slate-400 sm:text-xs">{label}</p><Icon className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${green ? 'text-emerald-600' : 'text-sky-600'}`} /></div><p className={`mt-2 text-2xl font-black sm:text-3xl ${green ? 'text-emerald-600' : 'text-sky-700'}`}>{value}</p></div>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>; }
