'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Edit3, Eye, EyeOff, GripVertical, Image as ImageIcon, MessageSquareQuote, Plus, Search, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@ui/Modal';
import StarRating from '@ui/StarRating';
import { useAdminTestimonials, useCreateTestimonial, useDeleteTestimonial, useReorderTestimonials, useUpdateTestimonial } from '@hooks/useTestimonials';
import AdminStatGrid from '@/components/admin/AdminStatGrid';

const SERVICE_TYPES = [
  ['local_shifting', 'Local Movers'], ['intercity_moving', 'Intercity Movers'],
  ['porter_labour_service', 'Labour & Vehicle'],
];
const emptyForm = { name: '', location: '', rating: 5, content: '', imageUrl: '', serviceType: 'local_shifting', isFeatured: false, status: 'active' };
const REVIEW_MIN_LENGTH = 40;
const REVIEW_MAX_LENGTH = 320;

export default function AdminTestimonialsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({ status: searchParams.get('status') || 'all', featured: 'all', serviceType: 'all' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { data = [], isLoading, isError, refetch } = useAdminTestimonials({ ...filters, search });
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const reorderMutation = useReorderTestimonials();
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const testimonials = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const filtered = testimonials.filter((item) => `${item.name} ${item.location || ''} ${item.content} ${item.bookingNumber || ''}`.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name || '', location: item.location || '', rating: item.rating || 5, content: item.content || '', imageUrl: item.imageUrl || '', serviceType: item.serviceType || 'general', isFeatured: Boolean(item.isFeatured), status: item.status || 'active' });
    setModalOpen(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, rating: Number(form.rating), imageUrl: form.imageUrl.trim() };
    payload.content = payload.content.trim();
    if (payload.content.length < REVIEW_MIN_LENGTH || payload.content.length > REVIEW_MAX_LENGTH) {
      return toast.error(`Review must be between ${REVIEW_MIN_LENGTH} and ${REVIEW_MAX_LENGTH} characters.`);
    }
    if (!payload.imageUrl) delete payload.imageUrl;
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing._id, data: payload });
      else await createMutation.mutateAsync(payload);
      toast.success(editing ? 'Testimonial updated' : 'Testimonial created');
      setModalOpen(false);
    } catch (error) { toast.error(error.message); }
  };
  const deactivate = async (item) => {
    if (!window.confirm(`Deactivate ${item.name}'s testimonial? It will be removed from the website.`)) return;
    try { await deleteMutation.mutateAsync(item._id); toast.success('Testimonial deactivated'); }
    catch (error) { toast.error(error.message); }
  };
  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await updateMutation.mutateAsync({ id: item._id, data: { status: nextStatus } });
      toast.success(nextStatus === 'active' ? 'Testimonial activated' : 'Testimonial hidden from website');
    } catch (error) {
      toast.error(error.message || 'Could not update testimonial status');
    }
  };
  const reorderTestimonial = async (targetId) => {
    const hasFilter = search || filters.status !== 'all' || filters.featured !== 'all' || filters.serviceType !== 'all';
    if (!draggingId || draggingId === targetId || hasFilter) return;
    const ids = testimonials.map((item) => item._id);
    const fromIndex = ids.indexOf(draggingId);
    const toIndex = ids.indexOf(targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, moved);
    try {
      await reorderMutation.mutateAsync(ids);
      toast.success('Testimonial order saved');
    } catch (error) {
      toast.error(error.message || 'Could not reorder testimonials');
    } finally {
      setDraggingId(null);
      setDragOverId(null);
    }
  };
  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file.');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be smaller than 2 MB.');
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, imageUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Social proof</p><h1 className="mt-1 text-2xl font-black text-slate-900">Testimonials</h1><p className="mt-1 text-sm text-slate-500">Manage customer stories displayed on the public website.</p></div><button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200"><Plus className="h-4 w-4" /> Add testimonial</button></header>

    <AdminStatGrid><Stat label="Total records" value={testimonials.length} icon={MessageSquareQuote} /><Stat label="Active" value={testimonials.filter((item) => item.status === 'active').length} icon={Eye} green /><Stat label="Featured" value={testimonials.filter((item) => item.isFeatured).length} icon={Star} /></AdminStatGrid>

    <section className="rounded-2xl border border-sky-100 bg-white shadow-sm"><div className="grid gap-3 border-b border-sky-100 p-4 md:grid-cols-[1fr_auto_auto_auto]"><label className="relative min-w-0"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, location, booking ID or review..." className="w-full rounded-xl border border-sky-100 bg-sky-50/60 py-2.5 pl-10 pr-4 text-sm text-slate-900" /></label><Filter value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={[['all', 'All statuses'], ['active', 'Active'], ['inactive', 'Inactive']]} /><Filter value={filters.featured} onChange={(featured) => setFilters({ ...filters, featured })} options={[['all', 'All placement'], ['true', 'Featured'], ['false', 'Standard']]} /><Filter value={filters.serviceType} onChange={(serviceType) => setFilters({ ...filters, serviceType })} options={[['all', 'All services'], ...SERVICE_TYPES]} /></div>
      {isLoading ? <div className="p-12 text-center text-sm text-slate-500">Loading testimonials...</div> : isError ? <div className="p-12 text-center"><p className="text-sm text-red-500">Could not load testimonials.</p><button onClick={() => refetch()} className="mt-3 text-sm font-bold text-sky-600">Try again</button></div> : filtered.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">No testimonials match these filters.</div> : <div className="grid min-w-0 gap-4 p-4 lg:grid-cols-2">{filtered.map((item) => <article key={item._id} draggable={!search && filters.status === 'all' && filters.featured === 'all' && filters.serviceType === 'all'} onDragStart={() => setDraggingId(item._id)} onDragEnter={() => setDragOverId(item._id)} onDragOver={(event) => event.preventDefault()} onDragEnd={() => { setDraggingId(null); setDragOverId(null); }} onDrop={() => reorderTestimonial(item._id)} className={`admin-drag-card min-w-0 rounded-2xl border border-sky-100 p-4 transition hover:border-sky-200 hover:shadow-sm sm:p-5 ${draggingId === item._id ? 'admin-drag-card-active opacity-90' : ''} ${dragOverId === item._id && draggingId !== item._id ? 'admin-drag-card-over' : ''}`}><div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-center gap-3"><span className="cursor-grab text-slate-300 active:cursor-grabbing" title="Drag testimonial"><GripVertical className="h-5 w-5" /></span><Avatar item={item} /><div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{item.name}</h2><p className="truncate text-xs font-semibold text-slate-400">{item.location || 'Location not added'}</p>{item.bookingNumber && <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-sky-600">{item.bookingNumber}</p>}</div></div><StarRating rating={item.rating} size="xs" className="shrink-0 pl-14 sm:pl-0" inactiveStarClassName="text-slate-200 dark:text-slate-600" /></div><p className="mt-4 line-clamp-3 min-h-[66px] break-words text-sm leading-6 text-slate-600">“{item.content}”</p><div className="mt-4 flex flex-wrap items-center gap-2"><Badge>{SERVICE_TYPES.find(([value]) => value === item.serviceType)?.[1] || 'General'}</Badge>{item.isFeatured && <Badge featured>Featured</Badge>}<Badge inactive={item.status !== 'active'}>{item.status === 'active' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{item.status || 'active'}</Badge></div><div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-sky-50 pt-4"><button onClick={() => toggleStatus(item)} disabled={updateMutation.isPending} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${item.status === 'active' ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>{item.status === 'active' ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{item.status === 'active' ? 'Make inactive' : 'Make active'}</button><button onClick={() => openEdit(item)} className="inline-flex items-center gap-2 rounded-xl border border-sky-100 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50"><Edit3 className="h-3.5 w-3.5" /> Edit</button><button onClick={() => deactivate(item)} disabled={item.status === 'inactive' || deleteMutation.isPending} className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-35"><Trash2 className="h-3.5 w-3.5" /> Deactivate</button></div></article>)}</div>}
    </section>

    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Update testimonial' : 'Add testimonial'} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Customer name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-field" /></Field><Field label="Location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="admin-field" placeholder="Surat" /></Field></div>
        <Field label="Review *"><textarea required minLength={REVIEW_MIN_LENGTH} maxLength={REVIEW_MAX_LENGTH} rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="admin-field resize-y" placeholder="Write a useful customer experience covering service quality, care and outcome..." /><span className={`mt-1.5 block text-right text-xs font-semibold ${form.content.length > REVIEW_MAX_LENGTH || (form.content.length > 0 && form.content.trim().length < REVIEW_MIN_LENGTH) ? 'text-red-500' : 'text-slate-400'}`}>{form.content.length}/{REVIEW_MAX_LENGTH} characters · minimum {REVIEW_MIN_LENGTH}</span></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Rating *"><select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="admin-field">{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} star{rating > 1 ? 's' : ''}</option>)}</select></Field><Field label="Service type"><select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className="admin-field">{SERVICE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field></div>
        <Field label="Customer image"><div className="grid gap-3 sm:grid-cols-[1fr_auto]"><div className="relative"><ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="admin-field pl-12" placeholder="Paste image URL here" /></div><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700 hover:bg-sky-100"><ImageIcon className="h-4 w-4" /> Choose file<input type="file" accept="image/*" onChange={chooseImage} className="sr-only" /></label></div>{form.imageUrl && <div className="mt-3 flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-3"><Image unoptimized src={form.imageUrl} alt="Selected customer" width={48} height={48} className="h-12 w-12 rounded-full object-cover" /><span className="text-xs font-bold text-slate-500">Image selected and ready</span></div>}</Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-field"><option value="active">Active</option><option value="inactive">Inactive</option></select></Field><label className="flex items-end"><span className="flex h-[46px] w-full items-center gap-3 rounded-xl border border-sky-100 px-3 text-sm font-bold text-slate-600"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="h-4 w-4 accent-sky-600" /> Featured</span></label></div>
        <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancel</button><button disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{editing ? 'Save changes' : 'Create testimonial'}</button></div>
      </form>
    </Modal>
  </div>;
}

function Stat({ label, value, icon: Icon, green }) { return <div className="admin-summary-card rounded-2xl border border-sky-100 bg-white p-3 sm:p-5"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase leading-tight text-slate-400 sm:text-xs">{label}</p><Icon className={`h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${green ? 'text-emerald-600' : 'text-sky-600'}`} /></div><p className={`mt-2 text-2xl font-black sm:text-3xl ${green ? 'text-emerald-600' : 'text-sky-700'}`}>{value}</p></div>; }
function Avatar({ item }) { return item.imageUrl ? <Image unoptimized src={item.imageUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-full border border-sky-100 object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-full border border-sky-100 bg-sky-50 font-black text-sky-700">{item.name?.charAt(0)?.toUpperCase()}</span>; }
function Badge({ children, featured, inactive }) { return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${inactive ? 'bg-slate-100 text-slate-500' : featured ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>{children}</span>; }
function Filter({ value, onChange, options }) { return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm font-bold text-slate-600">{options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>; }
