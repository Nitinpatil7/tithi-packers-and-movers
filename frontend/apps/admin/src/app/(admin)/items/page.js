'use client';

import { useEffect, useMemo, useState } from 'react';
import { Boxes, ChevronDown, ChevronRight, Edit3, GripVertical, Layers3, PackagePlus, Plus, Ruler, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@ui/Modal';
import { useAdminItemCatalog, useAdminSizes, useCreateGroup, useCreateItem, useCreateSection, useCreateSize, useDeleteGroup, useDeleteItem, useDeleteSection, useDeleteSize, useReorderGroups, useReorderItems, useUpdateGroup, useUpdateItem, useUpdateSection, useUpdateSize } from '@hooks/useItems';
import { DEFAULT_ITEM_ICON, ITEM_ICON_OPTIONS, ItemIcon, inferItemIcon } from '@utils/itemIcons';

const baseRecord = { name: '', description: '', sortOrder: 0, isActive: true };
const sizeIdOf = (size) => size.sizeId?._id || size.sizeId || size._id;

export default function AdminItemsPage() {
  const [activeSection, setActiveSection] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null);
  const [sizeManager, setSizeManager] = useState(false);
  const [dragging, setDragging] = useState(null);
  const { data = [], isLoading, isError, refetch } = useAdminItemCatalog({});
  const { data: globalSizes = [] } = useAdminSizes({});
  const sections = useMemo(() => Array.isArray(data) ? data : [], [data]);
  useEffect(() => { if (!activeSection && sections[0]) setActiveSection(sections[0]._id); }, [activeSection, sections]);
  const current = sections.find((section) => section._id === activeSection) || sections[0];
  useEffect(() => {
    setExpandedGroups(Object.fromEntries((current?.groups || []).map((group) => [group._id, false])));
  }, [activeSection, current?._id, current?.groups]);
  const groups = (current?.groups || []).map((group) => ({ ...group, items: (group.items || []).filter((item) => item.name?.toLowerCase().includes(search.toLowerCase())) })).filter((group) => !search || group.name?.toLowerCase().includes(search.toLowerCase()) || group.items.length);

  const mutations = {
    createSection: useCreateSection(), updateSection: useUpdateSection(), deleteSection: useDeleteSection(),
    createGroup: useCreateGroup(), updateGroup: useUpdateGroup(), deleteGroup: useDeleteGroup(),
    createItem: useCreateItem(), updateItem: useUpdateItem(), deleteItem: useDeleteItem(),
    createSize: useCreateSize(), updateSize: useUpdateSize(), deleteSize: useDeleteSize(),
    reorderGroups: useReorderGroups(), reorderItems: useReorderItems(),
  };
  const busy = Object.values(mutations).some((mutation) => mutation.isPending);

  const startDrag = (event, payload) => {
    if (search) return;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', payload.id);
    setDragging(payload);
  };

  const reorderList = async ({ type, parentId, fromId, toId, records }) => {
    if (!fromId || !toId || fromId === toId) {
      setDragging(null);
      return;
    }
    const ids = records.map((record) => record._id);
    const fromIndex = ids.indexOf(fromId);
    const toIndex = ids.indexOf(toId);
    if (fromIndex < 0 || toIndex < 0) {
      setDragging(null);
      return;
    }
    const [moved] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, moved);
    try {
      if (type === 'group') await mutations.reorderGroups.mutateAsync({ sectionId: parentId, orderedIds: ids });
      if (type === 'item') await mutations.reorderItems.mutateAsync({ groupId: parentId, orderedIds: ids });
      toast.success(type === 'group' ? 'Groups reordered' : 'Items reordered');
    } catch (error) {
      toast.error(error.message || 'Could not save order');
    } finally {
      setDragging(null);
    }
  };

  const saveEditor = async (form) => {
    try {
      if (editor.type === 'section') {
        const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
        if (editor.record) await mutations.updateSection.mutateAsync({ id: editor.record._id, data: payload });
        else await mutations.createSection.mutateAsync(payload);
      } else if (editor.type === 'group') {
        const payload = { ...form, sectionId: form.sectionId || current?._id, sortOrder: Number(form.sortOrder) || 0 };
        if (editor.record) await mutations.updateGroup.mutateAsync({ id: editor.record._id, data: payload });
        else await mutations.createGroup.mutateAsync(payload);
      } else if (editor.type === 'item') {
        const sizes = form.sizes.filter((size) => size.sizeId).map((size, index) => ({ sizeId: size.sizeId, price: Number(size.price) || 0, sortOrder: index, isActive: size.isActive !== false }));
        if (!sizes.length) throw new Error('Add at least one size and price.');
        const payload = { groupId: form.groupId || editor.group?._id, name: form.name.trim(), icon: form.icon || inferItemIcon(form.name), sizes, sortOrder: Number(form.sortOrder) || 0, isActive: form.isActive };
        if (editor.record) await mutations.updateItem.mutateAsync({ id: editor.record._id, data: payload });
        else await mutations.createItem.mutateAsync(payload);
      }
      toast.success(`${editor.type[0].toUpperCase()}${editor.type.slice(1)} saved`);
      setEditor(null);
    } catch (error) { toast.error(error.message); }
  };

  const remove = async (type, record) => {
    if (!window.confirm(`Deactivate “${record.name || record.label}”? Related records may also become inactive.`)) return;
    try { await mutations[`delete${type}`].mutateAsync(record._id); toast.success('Deactivated successfully'); }
    catch (error) { toast.error(error.message); }
  };

  return <div className="items-manager space-y-7 text-left">
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-600">Item catalog</p><h1 className="mt-1.5 text-2xl font-bold text-slate-900">Items Manager</h1><p className="mt-1 max-w-xl text-sm font-medium leading-6 text-slate-500">Organize booking items by section and group.</p></div><div className="flex flex-wrap gap-2"><Action icon={Ruler} onClick={() => setSizeManager(true)} secondary>Manage sizes</Action><Action icon={Plus} onClick={() => setEditor({ type: 'section' })}>New section</Action></div></header>

    <section className="grid gap-3 sm:grid-cols-3"><Stat icon={Layers3} label="Sections" value={sections.length} /><Stat icon={Boxes} label="Groups" value={sections.reduce((sum, section) => sum + (section.groups?.length || 0), 0)} /><Stat icon={PackagePlus} label="Items" value={sections.reduce((sum, section) => sum + (section.groups || []).reduce((total, group) => total + (group.items?.length || 0), 0), 0)} /></section>

    {isLoading ? <Empty text="Loading item catalog…" /> : isError ? <Empty text="Could not load the item catalog." action={() => refetch()} /> : !sections.length ? <Empty text="No sections yet. Create the first section to start your catalog." /> : <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
      <div className="flex gap-2 overflow-x-auto border-b border-sky-100 bg-sky-50/40 p-3">{sections.map((section) => <button key={section._id} onClick={() => setActiveSection(section._id)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${current?._id === section._id ? 'bg-sky-600 text-white shadow-md shadow-sky-100' : 'bg-white text-slate-600 ring-1 ring-sky-100 hover:text-sky-700'}`}>{section.name}<span className="ml-2 text-[10px] opacity-70">{section.groups?.length || 0}</span></button>)}</div>
      <div className="flex flex-col gap-3 border-b border-sky-100 p-4 md:flex-row md:items-center md:justify-between"><label className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-field pl-10" placeholder="Search groups or items…" /></label><div className="flex flex-wrap gap-2"><SmallButton icon={Edit3} onClick={() => setEditor({ type: 'section', record: current })}>Edit section</SmallButton><SmallButton icon={Trash2} danger onClick={() => remove('Section', current)}>Deactivate</SmallButton><SmallButton icon={Plus} primary onClick={() => setEditor({ type: 'group', section: current })}>Add group</SmallButton></div></div>
      <div className="space-y-3 p-4">
        {groups.length ? groups.map((group) => {
          const sourceGroup = (current?.groups || []).find((item) => item._id === group._id) || group;
          const open = expandedGroups[group._id] ?? true;
          const itemRecords = group.items || [];
          const reorderItemRecords = sourceGroup.items || [];
          return (
            <article
              key={group._id}
              onDragOver={(event) => { if (dragging?.type === 'group' && !search) event.preventDefault(); }}
              onDrop={() => !search && dragging?.type === 'group' && reorderList({ type: 'group', parentId: current?._id, fromId: dragging?.id, toId: group._id, records: current?.groups || [] })}
              className={`overflow-hidden rounded-2xl border border-sky-100 ${dragging?.type === 'group' && dragging?.id === group._id ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col gap-3 bg-sky-50/45 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    draggable={!search}
                    onDragStart={(event) => startDrag(event, { type: 'group', id: group._id })}
                    onDragEnd={() => setDragging(null)}
                    className="grid h-9 w-9 shrink-0 cursor-grab place-items-center rounded-xl bg-white text-slate-400 ring-1 ring-sky-100 active:cursor-grabbing"
                    title={search ? 'Clear search to reorder groups' : 'Drag group'}
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <button onClick={() => setExpandedGroups((value) => ({ ...value, [group._id]: !open }))} className="flex min-w-0 items-center gap-3 text-left">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sky-600 ring-1 ring-sky-100">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
                    <span><strong className="block text-sm text-slate-900">{group.name}</strong><span className="text-xs font-semibold text-slate-400">{itemRecords.length} items</span></span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2"><SmallButton icon={Edit3} onClick={() => setEditor({ type: 'group', record: group, section: current })}>Edit</SmallButton><SmallButton icon={Trash2} danger onClick={() => remove('Group', group)}>Deactivate</SmallButton><SmallButton icon={Plus} primary onClick={() => setEditor({ type: 'item', group })}>Add item</SmallButton></div>
              </div>
              {open && <div className="grid gap-3 p-3 md:grid-cols-2 2xl:grid-cols-3">
                {itemRecords.length ? itemRecords.map((item) => (
                  <div
                    key={item._id}
                    onDragOver={(event) => { if (dragging?.type === 'item' && !search) event.preventDefault(); }}
                    onDrop={() => !search && dragging?.type === 'item' && reorderList({ type: 'item', parentId: group._id, fromId: dragging?.id, toId: item._id, records: reorderItemRecords })}
                    className={`flex min-h-32 flex-col justify-between rounded-2xl border border-slate-100 p-4 transition hover:border-sky-200 hover:shadow-sm ${dragging?.type === 'item' && dragging?.id === item._id ? 'opacity-60' : ''}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2">
                          <span
                            draggable={!search}
                            onDragStart={(event) => startDrag(event, { type: 'item', id: item._id })}
                            onDragEnd={() => setDragging(null)}
                            className="mt-0.5 cursor-grab text-slate-300 active:cursor-grabbing"
                            title={search ? 'Clear search to reorder items' : 'Drag item'}
                          ><GripVertical className="h-4 w-4" /></span>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100"><ItemIcon icon={item.icon || inferItemIcon(item.name)} className="h-4.5 w-4.5" /></span>
                          <h3 className="text-sm font-black text-slate-800">{item.name}</h3>
                        </div>
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.isActive === false ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">{(item.sizes || []).map((size) => <span key={size._id || `${item._id}-${size.sizeKey}`} className="rounded-lg bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700">{size.label || size.sizeKey}: ₹{Number(size.price || 0).toLocaleString('en-IN')}</span>)}</div>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3"><SmallButton icon={Edit3} onClick={() => setEditor({ type: 'item', record: item, group })}>Edit item</SmallButton><SmallButton icon={Trash2} danger onClick={() => remove('Item', item)}>Deactivate</SmallButton></div>
                  </div>
                )) : <p className="col-span-full py-8 text-center text-sm font-semibold text-slate-400">No items in this group yet.</p>}
              </div>}
            </article>
          );
        }) : <Empty text="No groups or items match your search." />}
      </div>
    </section>}

    <RecordEditor editor={editor} sections={sections} globalSizes={globalSizes} busy={busy} onClose={() => setEditor(null)} onSave={saveEditor} />
    <SizeManager open={sizeManager} sizes={globalSizes} mutations={mutations} onClose={() => setSizeManager(false)} />
  </div>;
}

function RecordEditor({ editor, sections, globalSizes, busy, onClose, onSave }) {
  const record = editor?.record;
  const [form, setForm] = useState(baseRecord);
  useEffect(() => {
    if (!editor) return;
    if (editor.type === 'item') setForm({ name: record?.name || '', icon: record?.icon || inferItemIcon(record?.name || ''), groupId: record?.groupId || editor.group?._id || '', sortOrder: record?.sortOrder || 0, isActive: record?.isActive !== false, sizes: (record?.sizes || []).map((size) => ({ sizeId: sizeIdOf(size), price: size.price, isActive: size.isActive !== false })) });
    else setForm({ ...baseRecord, ...(record || {}), sectionId: record?.categoryId?._id || record?.categoryId || editor.section?._id || '' });
  }, [editor, record]);
  if (!editor) return null;
  const title = `${record ? 'Edit' : 'Add'} ${editor.type}`;
  const updateSize = (index, changes) => setForm((value) => ({ ...value, sizes: value.sizes.map((size, position) => position === index ? { ...size, ...changes } : size) }));
  return <Modal isOpen onClose={onClose} title={title} size="lg"><form onSubmit={(event) => { event.preventDefault(); onSave(form); }} className="space-y-4"><Field label="Name *"><input required value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} className="admin-field" /></Field>{editor.type !== 'item' && <Field label="Description"><textarea rows={3} value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} className="admin-field resize-y" /></Field>}{editor.type === 'group' && <Field label="Section *"><select required value={form.sectionId || ''} onChange={(event) => setForm({ ...form, sectionId: event.target.value })} className="admin-field">{sections.map((section) => <option key={section._id} value={section._id}>{section.name}</option>)}</select></Field>}{editor.type === 'item' && <IconPicker value={form.icon || DEFAULT_ITEM_ICON} onChange={(icon) => setForm({ ...form, icon })} />}{editor.type === 'item' && <Field label="Sizes and prices *"><div className="space-y-2">{(form.sizes || []).map((size, index) => <div key={index} className="grid grid-cols-[1fr_120px_auto] gap-2"><select required value={size.sizeId} onChange={(event) => updateSize(index, { sizeId: event.target.value })} className="admin-field"><option value="">Select size</option>{globalSizes.map((choice) => <option key={choice._id} value={choice._id}>{choice.label || choice.key}</option>)}</select><input required type="number" min="0" value={size.price} onChange={(event) => updateSize(index, { price: event.target.value })} className="admin-field" placeholder="Price" /><button type="button" onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, position) => position !== index) })} className="rounded-xl border border-red-100 px-3 text-red-500"><Trash2 className="h-4 w-4" /></button></div>)}<button type="button" onClick={() => setForm({ ...form, sizes: [...(form.sizes || []), { sizeId: '', price: 0, isActive: true }] })} className="text-sm font-bold text-sky-600">+ Add size variant</button></div></Field>}<div className="grid gap-4 sm:grid-cols-2"><Field label="Sort order"><input type="number" min="0" value={form.sortOrder || 0} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} className="admin-field" /></Field><label className="flex items-end"><span className="flex h-[46px] w-full items-center gap-3 rounded-xl border border-sky-100 px-3 text-sm font-bold text-slate-600"><input type="checkbox" checked={form.isActive !== false} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-sky-600" />Active</span></label></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancel</button><button disabled={busy} className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">Save {editor.type}</button></div></form></Modal>;
}

function IconPicker({ value, onChange }) {
  const [query, setQuery] = useState('');
  const icons = ITEM_ICON_OPTIONS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || item.key.includes(query.toLowerCase()));
  return <Field label="Item icon *"><div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3"><label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="admin-field bg-white pl-10" placeholder="Search icons..." /></label><div className="mt-3 grid max-h-52 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">{icons.map(({ key, label, Icon }) => <button key={key} type="button" onClick={() => onChange(key)} className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center text-[11px] font-bold transition ${value === key ? 'border-sky-500 bg-white text-sky-700 shadow-sm' : 'border-sky-100 bg-white/70 text-slate-500 hover:border-sky-300 hover:text-sky-700'}`}><Icon className="h-5 w-5" strokeWidth={1.7} /><span className="line-clamp-2">{label}</span></button>)}</div></div></Field>;
}

function SizeManager({ open, sizes, mutations, onClose }) {
  const [editing, setEditing] = useState(null); const [form, setForm] = useState({ key: '', label: '', description: '', sortOrder: 0, isActive: true });
  useEffect(() => { setForm(editing ? { ...editing } : { key: '', label: '', description: '', sortOrder: 0, isActive: true }); }, [editing, open]);
  const save = async (event) => { event.preventDefault(); try { const data = { ...form, key: form.key.trim().toUpperCase(), label: form.label.trim(), sortOrder: Number(form.sortOrder) || 0 }; if (editing) await mutations.updateSize.mutateAsync({ id: editing._id, data }); else await mutations.createSize.mutateAsync(data); toast.success('Size saved'); setEditing(null); } catch (error) { toast.error(error.message); } };
  return <Modal isOpen={open} onClose={onClose} title="Global size choices" size="lg"><div className="grid gap-5 md:grid-cols-2"><div className="space-y-2">{sizes.map((size) => <div key={size._id} className="flex items-center justify-between rounded-xl border border-sky-100 p-3"><div><strong className="text-sm text-slate-800">{size.label}</strong><p className="text-xs font-bold text-sky-600">{size.key}</p></div><div className="flex gap-1"><button onClick={() => setEditing(size)} className="p-2 text-sky-600"><Edit3 className="h-4 w-4" /></button><button onClick={async () => { if (window.confirm(`Deactivate ${size.label}?`)) await mutations.deleteSize.mutateAsync(size._id); }} className="p-2 text-red-500"><Trash2 className="h-4 w-4" /></button></div></div>)}</div><form onSubmit={save} className="space-y-3 rounded-2xl bg-sky-50/50 p-4"><h3 className="font-black text-slate-800">{editing ? 'Edit size' : 'Add size'}</h3><Field label="Key *"><input required value={form.key} onChange={(event) => setForm({ ...form, key: event.target.value })} className="admin-field" placeholder="XL" /></Field><Field label="Label *"><input required value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} className="admin-field" placeholder="Extra Large" /></Field><Field label="Sort order"><input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} className="admin-field" /></Field><div className="flex gap-2"><button className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white">Save</button>{editing && <button type="button" onClick={() => setEditing(null)} className="text-sm font-bold text-slate-500">Cancel edit</button>}</div></form></div></Modal>;
}

function Action({ icon: Icon, children, onClick, secondary }) { return <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${secondary ? 'border border-sky-200 bg-white text-sky-700' : 'bg-sky-600 text-white shadow-lg shadow-sky-100'}`}><Icon className="h-4 w-4" />{children}</button>; }
function SmallButton({ icon: Icon, children, onClick, primary, danger }) { return <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${primary ? 'border-sky-600 bg-sky-600 text-white' : danger ? 'border-red-100 bg-white text-red-500' : 'border-sky-100 bg-white text-sky-700'}`}><Icon className="h-3.5 w-3.5" />{children}</button>; }
function Stat({ icon: Icon, label, value }) { return <div className="rounded-2xl border border-sky-100 bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50"><Icon className="h-4.5 w-4.5 text-sky-600" /></span></div><strong className="mt-3 block text-3xl font-bold text-sky-700">{value}</strong></div>; }
function Empty({ text, action }) { return <div className="rounded-2xl border border-dashed border-sky-200 p-10 text-center text-sm font-semibold text-slate-400">{text}{action && <button onClick={action} className="ml-2 font-bold text-sky-600">Try again</button>}</div>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>; }
