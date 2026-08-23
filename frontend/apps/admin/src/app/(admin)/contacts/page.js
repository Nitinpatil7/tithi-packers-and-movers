'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock3, Eye, Mail, MessageSquareText, Phone, Search, Trash2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@ui/Card';
import Modal from '@ui/Modal';
import Button from '@ui/Button';
import { useContactDetail, useContacts, useDeleteContact, useUpdateContact } from '@/hooks/useContacts';
import { formatDate } from '@utils/utils';

const statuses = ['new', 'contacted', 'resolved', 'spam'];
const statusStyle = { new: 'bg-sky-100 text-sky-700', contacted: 'bg-amber-100 text-amber-700', resolved: 'bg-emerald-100 text-emerald-700', spam: 'bg-red-100 text-red-700' };

export default function ContactQueriesPage() {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get('highlight') || '';
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [edit, setEdit] = useState({ status: 'new', adminNotes: '' });
  const rowRefs = useRef({});
  const { data = [], isLoading, isError, refetch } = useContacts(status);
  const { data: detail, isLoading: detailLoading } = useContactDetail(selectedId);
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();
  const inquiries = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (detail) setEdit({ status: detail.status || 'new', adminNotes: detail.adminNotes || '' });
  }, [detail]);

  useEffect(() => {
    if (!highlightedId || isLoading) return;
    const node = rowRefs.current[highlightedId];
    if (node) window.setTimeout(() => node.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
  }, [highlightedId, inquiries.length, isLoading, search, status]);

  const visible = inquiries.filter((item) => {
    const q = search.toLowerCase();
    return !q || [item.name, item.mobile, item.email, item.subject, item.message].some((value) => value?.toLowerCase().includes(q));
  });

  const save = async () => {
    try {
      await updateMutation.mutateAsync({ id: selectedId, data: edit });
      toast.success('Inquiry updated successfully');
      setSelectedId(null);
    } catch (error) { toast.error(error.message); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Permanently delete inquiry from ${item.name}?`)) return;
    try { await deleteMutation.mutateAsync(item._id); toast.success('Inquiry deleted'); }
    catch (error) { toast.error(error.message); }
  };

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Customer support</p><h1 className="mt-1 text-2xl font-black text-slate-900">Contact Queries</h1><p className="mt-1 text-sm text-slate-500">Review website inquiries, add internal notes, and track follow-ups.</p></div>

      <div className="grid gap-4 sm:grid-cols-4">
        {statuses.map((item) => <Card key={item} className="p-4 border-sky-100"><p className="text-xs font-bold uppercase text-slate-400">{item}</p><p className="mt-2 text-2xl font-black text-slate-800">{inquiries.filter((query) => query.status === item).length}</p></Card>)}
      </div>

      <Card className="overflow-hidden border-sky-100 bg-white">
        <div className="flex flex-col gap-3 border-b border-sky-100 p-4 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, mobile, email or message..." className="w-full rounded-xl border border-sky-100 bg-sky-50/50 py-2.5 pl-10 pr-4 text-sm" /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"><option value="all">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        {isLoading ? <div className="p-12 text-center text-sm text-slate-500">Loading inquiries...</div> : isError ? <div className="p-12 text-center"><p className="text-sm text-red-500">Could not load inquiries.</p><button onClick={() => refetch()} className="mt-3 font-bold text-sky-600">Try again</button></div> : visible.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No contact inquiries found.</div> : (
          <div className="divide-y divide-sky-50">{visible.map((item) => (
            <div key={item._id} ref={(node) => { rowRefs.current[item._id] = node; }} className={`flex flex-col gap-4 p-5 transition lg:flex-row lg:items-center ${highlightedId === item._id ? 'bg-amber-50 ring-2 ring-inset ring-amber-300' : 'hover:bg-sky-50/40'}`}>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-600"><MessageSquareText className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{item.name || 'Item search visitor'}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle[item.status] || statusStyle.new}`}>{item.status || 'new'}</span>{item.source === 'item_search' && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">Item search</span>}</div><p className="mt-1 text-sm font-semibold text-slate-700">{item.subject || 'General inquiry'}</p><p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.message}</p><div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">{item.mobile && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{item.mobile}</span>}{item.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{item.email}</span>}<span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatDate(item.createdAt)}</span></div></div>
              <div className="flex gap-2 pl-14 lg:pl-0"><button onClick={() => setSelectedId(item._id)} className="rounded-xl border border-sky-100 p-2.5 text-sky-600 hover:bg-sky-50" aria-label="View inquiry"><Eye className="h-4 w-4" /></button><button onClick={() => remove(item)} disabled={deleteMutation.isPending} className="rounded-xl border border-red-100 p-2.5 text-red-500 hover:bg-red-50" aria-label="Delete inquiry"><Trash2 className="h-4 w-4" /></button></div>
            </div>
          ))}</div>
        )}
      </Card>

      <Modal isOpen={Boolean(selectedId)} onClose={() => setSelectedId(null)} title="Contact Inquiry" size="lg">
        {detailLoading || !detail ? <div className="py-10 text-center text-sm text-slate-500">Loading full inquiry...</div> : (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-2xl bg-sky-50 p-5 sm:grid-cols-2"><p className="flex items-center gap-2 font-bold text-slate-800"><UserRound className="h-4 w-4 text-sky-600" />{detail.name || 'Item search visitor'}</p>{detail.mobile && <p className="flex items-center gap-2 text-sm text-slate-600"><Phone className="h-4 w-4 text-sky-600" />{detail.mobile}</p>}{detail.email && <p className="flex items-center gap-2 text-sm text-slate-600"><Mail className="h-4 w-4 text-sky-600" />{detail.email}</p>}{detail.source === 'item_search' && <p className="text-sm font-bold text-amber-700">Searched: {detail.searchedTerm || 'Not provided'}</p>}</div>
            <div><p className="text-xs font-bold uppercase text-slate-400">{detail.subject || 'General inquiry'}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{detail.message}</p></div>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold uppercase text-slate-500">Status<select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} className="mt-2 w-full rounded-xl border border-sky-100 bg-white p-3 text-sm normal-case text-slate-800">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold uppercase text-slate-500">Admin notes<textarea rows={4} value={edit.adminNotes} onChange={(e) => setEdit({ ...edit, adminNotes: e.target.value })} className="mt-2 w-full rounded-xl border border-sky-100 bg-white p-3 text-sm normal-case text-slate-800" placeholder="Private follow-up notes..." /></label></div>
            <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setSelectedId(null)}>Close</Button><Button loading={updateMutation.isPending} onClick={save}>Save Update</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
