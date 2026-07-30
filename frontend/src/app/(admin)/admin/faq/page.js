'use client';

import { useMemo, useState } from 'react';
import { CircleHelp, Edit3, Eye, EyeOff, GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCreateFaq, useDeleteFaq, useFaqs, useReorderFaqs, useUpdateFaq } from '@/hooks/useFaq';

const emptyForm = { question: '', answer: '', category: 'general', sortOrder: 0, isActive: true };

export default function AdminFaqPage() {
  const { data = [], isLoading, isError, refetch } = useFaqs();
  const createMutation = useCreateFaq();
  const updateMutation = useUpdateFaq();
  const deleteMutation = useDeleteFaq();
  const reorderMutation = useReorderFaqs();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [draggingId, setDraggingId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);

  const faqs = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const categories = useMemo(() => [...new Set(faqs.map((faq) => faq.category || 'general'))], [faqs]);
  const filtered = faqs.filter((faq) => {
    const matchesCategory = category === 'all' || (faq.category || 'general') === category;
    const query = search.toLowerCase();
    return matchesCategory && (!query || faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query));
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (faq) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category || 'general', sortOrder: faq.sortOrder || 0, isActive: faq.isActive !== false });
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing._id, data: payload });
      else await createMutation.mutateAsync(payload);
      toast.success(editing ? 'FAQ updated successfully' : 'FAQ published successfully');
      setModalOpen(false);
    } catch (error) { toast.error(error.message); }
  };

  const remove = async (faq) => {
    if (!window.confirm(`Deactivate “${faq.question}”?`)) return;
    try { await deleteMutation.mutateAsync(faq._id); toast.success('FAQ deactivated'); }
    catch (error) { toast.error(error.message); }
  };

  const reorderFaq = async (targetId) => {
    if (!draggingId || draggingId === targetId || search || category !== 'all') return;
    const ids = faqs.map((faq) => faq._id);
    const fromIndex = ids.indexOf(draggingId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, moved);
    try {
      await reorderMutation.mutateAsync(ids);
      toast.success('FAQ order saved');
    } catch (error) {
      toast.error(error.message || 'Could not reorder FAQs');
    } finally {
      setDraggingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Content management</p><h1 className="mt-1 text-2xl font-black text-slate-900">FAQ Manager</h1><p className="mt-1 text-sm text-slate-500">Publish and organize customer questions shown on the website.</p></div>
        <Button icon={Plus} onClick={openCreate}>Add FAQ</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-sky-100"><p className="text-xs font-bold uppercase text-slate-400">Published FAQs</p><p className="mt-2 text-3xl font-black text-sky-700">{faqs.length}</p></Card>
        <Card className="p-5 border-sky-100"><p className="text-xs font-bold uppercase text-slate-400">Categories</p><p className="mt-2 text-3xl font-black text-sky-700">{categories.length}</p></Card>
        <Card className="p-5 border-sky-100"><p className="text-xs font-bold uppercase text-slate-400">Visible now</p><p className="mt-2 text-3xl font-black text-emerald-600">{faqs.filter((faq) => faq.isActive !== false).length}</p></Card>
      </div>

      <Card className="overflow-hidden border-sky-100 bg-white">
        <div className="flex flex-col gap-3 border-b border-sky-100 p-4 md:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions or answers..." className="w-full rounded-xl border border-sky-100 bg-sky-50/50 py-2.5 pl-10 pr-4 text-sm" /></div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>
        {isLoading ? <div className="p-12 text-center text-sm text-slate-500">Loading FAQs...</div> : isError ? <div className="p-12 text-center"><p className="text-sm text-red-500">Could not load FAQs.</p><button onClick={() => refetch()} className="mt-3 text-sm font-bold text-sky-600">Try again</button></div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No FAQs found.</div> : (
          <div className="divide-y divide-sky-50">
            {filtered.map((faq) => (
              <div
                key={faq._id}
                draggable={!search && category === 'all'}
                onDragStart={() => setDraggingId(faq._id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => reorderFaq(faq._id)}
                className={`flex flex-col gap-4 p-5 hover:bg-sky-50/40 lg:flex-row lg:items-start ${draggingId === faq._id ? 'opacity-60' : ''}`}
              >
                <div className="flex min-w-0 flex-1 gap-4">
                  <span className="grid h-10 w-10 shrink-0 cursor-grab place-items-center rounded-xl bg-sky-100 text-sky-600 active:cursor-grabbing" title="Drag FAQ">
                    <GripVertical className="h-5 w-5" />
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600"><CircleHelp className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900">{faq.question}</h3>
                      <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase text-sky-700">{faq.category || 'general'}</span>
                      {faq.isActive === false ? <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><EyeOff className="h-3.5 w-3.5" /> Inactive</span> : <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><Eye className="h-3.5 w-3.5" /> Active</span>}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{faq.answer}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-400">Sort order: {faq.sortOrder || 0}</p>
                  </div>
                </div>
                <div className="flex gap-2 pl-14 lg:pl-0"><button onClick={() => openEdit(faq)} className="rounded-xl border border-sky-100 p-2.5 text-sky-600 hover:bg-sky-50" aria-label="Edit FAQ"><Edit3 className="h-4 w-4" /></button><button onClick={() => remove(faq)} disabled={deleteMutation.isPending} className="rounded-xl border border-red-100 p-2.5 text-red-500 hover:bg-red-50" aria-label="Delete FAQ"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Update FAQ' : 'Publish New FAQ'} size="lg">
        <form onSubmit={submit} className="space-y-5">
          <Input label="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required placeholder="What do customers usually ask?" />
          <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Answer</span><textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required rows={6} placeholder="Write a clear, helpful answer..." className="w-full rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-900" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="general" /><Input label="Sort order" type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></div>
          <label className="flex items-center gap-3 rounded-xl bg-sky-50 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-sky-600" /> Show this FAQ on the public website</label>
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'Save Changes' : 'Publish FAQ'}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
