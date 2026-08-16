'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Puzzle, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@ui/Modal';
import { useAdminSections } from '@hooks/useItems';
import { useAdminAddons, useCreateAddon, useDeleteAddon, useTriggerGroups, useTriggerItems, useUpdateAddon } from '@hooks/useAddons';
import { ItemIcon } from '@utils/itemIcons';

const EMPTY = { name: '', description: '', unit: 'per_item', price: 0, appliesToServiceTypes: ['local_shifting', 'intercity_moving'], triggerCategoryIds: [], triggerGroupIds: [], triggerItemIds: [], isOptional: true, isActive: true, sortOrder: 0 };
const categoryId = (value) => String(value?._id || value?.id || value || '');
const groupId = (value) => String(value?._id || value?.id || value || '');
const itemId = (value) => String(value?._id || value?.id || value || '');
const byCatalogOrder = (sectionOrder) => (a, b) => {
  const aSection = sectionOrder.get(String(a.sectionId || '')) ?? Number.MAX_SAFE_INTEGER;
  const bSection = sectionOrder.get(String(b.sectionId || '')) ?? Number.MAX_SAFE_INTEGER;
  if (aSection !== bSection) return aSection - bSection;
  const aSort = Number(a.sortOrder || 0);
  const bSort = Number(b.sortOrder || 0);
  if (aSort !== bSort) return aSort - bSort;
  return String(a.name || '').localeCompare(String(b.name || ''));
};

export default function AdminAddonsPage() {
  const [filters, setFilters] = useState({ isActive: 'all', serviceType: 'all' });
  const [editor, setEditor] = useState(null);
  const { data = [], isLoading, isError, refetch } = useAdminAddons(filters);
  const createMutation = useCreateAddon(); const updateMutation = useUpdateAddon(); const deleteMutation = useDeleteAddon();
  const addons = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const remove = async (item) => { if (!window.confirm(`Deactivate “${item.name}”?`)) return; try { await deleteMutation.mutateAsync(item._id); toast.success('Add-on deactivated'); } catch (error) { toast.error(error.message); } };
  return <div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-sky-600">Booking services</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Add-on Services</h1><p className="mt-1 text-sm font-medium text-slate-500">Group-triggered optional services for local and intercity moves.</p></div><button onClick={() => setEditor({})} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" />New add-on</button></header>
    <div className="flex flex-wrap gap-2 rounded-2xl border border-sky-100 bg-white p-3"><select value={filters.serviceType} onChange={(event) => setFilters({ ...filters, serviceType: event.target.value })} className="rounded-xl border border-sky-100 px-3 py-2 text-sm font-semibold text-slate-600"><option value="all">All services</option><option value="local_shifting">Local shifting</option><option value="intercity_moving">Intercity moving</option></select><select value={filters.isActive} onChange={(event) => setFilters({ ...filters, isActive: event.target.value })} className="rounded-xl border border-sky-100 px-3 py-2 text-sm font-semibold text-slate-600"><option value="all">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></div>
    {isLoading ? <State text="Loading add-ons…" /> : isError ? <State text="Could not load add-ons." action={refetch} /> : addons.length === 0 ? <State text="No add-on services found." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{addons.map((item) => <article key={item._id} className="flex min-h-56 flex-col rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><Puzzle className="h-4 w-4" /></span><div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{item.name}</h2><p className="text-xs font-medium text-slate-400">{item.unit?.replaceAll('_', ' ')} · ₹{Number(item.price || 0).toLocaleString('en-IN')}</p></div></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${item.isActive === false ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>{item.isActive === false ? 'Inactive' : 'Active'}</span></div><p className="mt-4 line-clamp-4 min-h-[5.5rem] text-sm leading-6 text-slate-500">{item.description || 'No description added.'}</p><div className="mt-auto flex justify-end gap-2 border-t border-slate-100 pt-4"><button onClick={() => setEditor(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 px-3 py-2 text-xs font-semibold text-sky-700"><Edit3 className="h-3.5 w-3.5" />Edit</button><button onClick={() => remove(item)} disabled={item.isActive === false} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 disabled:opacity-35"><Trash2 className="h-3.5 w-3.5" />Deactivate</button></div></article>)}</div>}
    <AddonEditor record={editor} onClose={() => setEditor(null)} onSave={async (payload) => { try { if (editor?._id) await updateMutation.mutateAsync({ id: editor._id, data: payload }); else await createMutation.mutateAsync(payload); toast.success(editor?._id ? 'Add-on updated' : 'Add-on created'); setEditor(null); } catch (error) { toast.error(error.message); } }} busy={createMutation.isPending || updateMutation.isPending} />
  </div>;
}

function AddonEditor({ record, onClose, onSave, busy }) {
  const [form, setForm] = useState(EMPTY);
  const [section, setSection] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const { data: sections = [] } = useAdminSections({ isActive: true });
  const { data: groups = [], isLoading } = useTriggerGroups({ search: debounced, sectionId: section, limit: 100 });
  const { data: itemGroups = [], isLoading: isLoadingItems } = useTriggerItems({ search: debounced, sectionId: section, limit: 1000 });
  const orderedSections = useMemo(() => [...sections].sort((a, b) => (Number(a.sortOrder || 0) - Number(b.sortOrder || 0)) || String(a.name || '').localeCompare(String(b.name || ''))), [sections]);
  const sectionOrder = useMemo(() => new Map(orderedSections.map((item, index) => [categoryId(item), index])), [orderedSections]);

  useEffect(() => {
    if (!record) return;
    setForm(record._id ? {
      ...EMPTY,
      ...record,
      triggerCategoryIds: (record.triggerCategoryIds || []).map(categoryId).filter(Boolean),
      triggerGroupIds: (record.triggerGroupIds || []).map(groupId).filter(Boolean),
      triggerItemIds: (record.triggerItemIds || []).map(itemId).filter(Boolean),
    } : EMPTY);
  }, [record]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const orderedApplicabilityGroups = useMemo(() => {
    const itemGroupMap = new Map((itemGroups || []).map((group) => [groupId(group), group]));
    const orderedIds = new Set();
    const ordered = (groups || []).map((group) => {
      const id = groupId(group);
      orderedIds.add(id);
      return { ...group, id, items: itemGroupMap.get(id)?.items || [] };
    });
    (itemGroups || []).forEach((group) => {
      const id = groupId(group);
      if (!orderedIds.has(id)) ordered.push({ ...group, id, items: group.items || [] });
    });
    return ordered.map((group) => ({
      ...group,
      items: (group.items || [])
        .map((item) => ({ ...item, id: itemId(item) }))
        .sort((a, b) => (Number(a.sortOrder || 0) - Number(b.sortOrder || 0)) || String(a.name || '').localeCompare(String(b.name || ''))),
    })).sort(byCatalogOrder(sectionOrder));
  }, [groups, itemGroups, sectionOrder]);

  if (!record) return null;

  const selectedCategoryIds = new Set(form.triggerCategoryIds.map(String));
  const selectedGroupIds = new Set(form.triggerGroupIds.map(String));
  const selectedItemIds = new Set(form.triggerItemIds.map(String));
  const toggleService = (value) => setForm((current) => ({
    ...current,
    appliesToServiceTypes: current.appliesToServiceTypes.includes(value)
      ? current.appliesToServiceTypes.filter((item) => item !== value)
      : [...current.appliesToServiceTypes, value],
  }));
  const toggleCategory = (category) => setForm((current) => {
    const id = categoryId(category);
    const selected = current.triggerCategoryIds.includes(id);
    const groupIdsInCategory = orderedApplicabilityGroups.filter((group) => String(group.sectionId || '') === id).map(groupId).filter(Boolean);
    const itemIdsInCategory = orderedApplicabilityGroups
      .filter((group) => String(group.sectionId || '') === id)
      .flatMap((group) => group.items || [])
      .map(itemId)
      .filter(Boolean);
    return {
      ...current,
      triggerCategoryIds: selected
        ? current.triggerCategoryIds.filter((item) => item !== id)
        : [...new Set([...current.triggerCategoryIds, id])],
      triggerGroupIds: selected
        ? current.triggerGroupIds
        : current.triggerGroupIds.filter((item) => !groupIdsInCategory.includes(item)),
      triggerItemIds: selected
        ? current.triggerItemIds
        : current.triggerItemIds.filter((item) => !itemIdsInCategory.includes(item)),
    };
  });
  const toggleGroup = (group) => setForm((current) => {
    const id = groupId(group);
    const idsInGroup = (group.items || []).map(itemId).filter(Boolean);
    const selected = current.triggerGroupIds.includes(id);
    return {
      ...current,
      triggerGroupIds: selected
        ? current.triggerGroupIds.filter((item) => item !== id)
        : [...new Set([...current.triggerGroupIds, id])],
      triggerItemIds: selected
        ? current.triggerItemIds.filter((item) => !idsInGroup.includes(item))
        : [...new Set([...current.triggerItemIds, ...idsInGroup])],
    };
  });
  const toggleItem = (id) => setForm((current) => ({
    ...current,
    triggerItemIds: current.triggerItemIds.includes(id)
      ? current.triggerItemIds.filter((item) => item !== id)
      : [...current.triggerItemIds, id],
  }));
  const hasTriggers = form.triggerCategoryIds.length || form.triggerGroupIds.length || form.triggerItemIds.length;

  return (
    <Modal isOpen onClose={onClose} title={record._id ? 'Edit add-on' : 'Create add-on'} size="lg">
      <form onSubmit={(event) => { event.preventDefault(); onSave({ ...form, price: Number(form.price) || 0, sortOrder: Number(form.sortOrder) || 0 }); }} className="space-y-4">
        <Field label="Name *"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="admin-field" /></Field>
        <Field label="Description"><textarea rows={3} value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} className="admin-field resize-y" /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Unit"><select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className="admin-field">{['per_unit','per_room','per_item','flat','percentage'].map((unit) => <option key={unit}>{unit}</option>)}</select></Field>
          <Field label="Price *"><input required type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="admin-field" /></Field>
          <Field label="Sort order"><input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} className="admin-field" /></Field>
        </div>
        <Field label="Services *">
          <div className="flex flex-wrap gap-2">
            {[
              ['local_shifting','Local shifting'],
              ['intercity_moving','Intercity moving'],
            ].map(([value,label]) => (
              <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${form.appliesToServiceTypes.includes(value) ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-500'}`}>
                <input type="checkbox" checked={form.appliesToServiceTypes.includes(value)} onChange={() => toggleService(value)} className="accent-sky-600" />
                {label}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Applicability">
          <div className="rounded-2xl border border-sky-100">
            <div className="grid gap-2 border-b border-sky-100 p-3 sm:grid-cols-2">
              <select value={section} onChange={(event) => setSection(event.target.value)} className="admin-field">
                <option value="">All sections</option>
                {orderedSections.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-field has-leading-icon" placeholder="Search groups or items..." />
              </label>
            </div>
            <div className="grid gap-3 p-3 lg:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Apply to category</p>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {orderedSections.map((category) => {
                    const id = categoryId(category);
                    return (
                      <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${selectedCategoryIds.has(id) ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-600'}`}>
                        <input type="checkbox" checked={selectedCategoryIds.has(id)} onChange={() => toggleCategory(category)} className="accent-emerald-600" />
                        <span className="min-w-0"><strong className="font-semibold">{category.name}</strong><small className="ml-2 text-slate-400">All groups/items</small></span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Apply to whole group</p>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {isLoading ? (
                    <p className="p-4 text-center text-xs text-slate-400">Loading groups...</p>
                  ) : orderedApplicabilityGroups.map((group) => {
                    const categorySelected = selectedCategoryIds.has(String(group.sectionId || ''));
                    const checked = categorySelected || selectedGroupIds.has(group.id);
                    return (
                      <label key={group.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${checked ? 'bg-sky-50 text-sky-800' : 'hover:bg-slate-50 text-slate-600'} ${categorySelected ? 'cursor-default' : 'cursor-pointer'}`}>
                        <input type="checkbox" checked={checked} disabled={categorySelected} onChange={() => toggleGroup(group)} className="accent-sky-600 disabled:cursor-not-allowed" />
                        <span className="min-w-0"><strong className="font-semibold">{group.name}</strong><small className="ml-2 text-slate-400">{group.section}</small></span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Apply to specific items</p>
                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {isLoadingItems ? (
                    <p className="p-4 text-center text-xs text-slate-400">Loading items...</p>
                  ) : orderedApplicabilityGroups.map((group) => {
                    const categorySelected = selectedCategoryIds.has(String(group.sectionId || ''));
                    const groupSelected = categorySelected || selectedGroupIds.has(group.id);
                    return (
                      <div key={group.id}>
                        <h4 className="sticky top-0 z-10 mb-2 flex items-center justify-between gap-2 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-orange-50 px-3 py-2 text-xs shadow-sm">
                          <span className="min-w-0"><span className="block truncate font-black text-slate-800">{group.name}</span><span className="mt-0.5 block truncate font-semibold text-sky-600">{group.section}</span></span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-1 font-black text-slate-400 ring-1 ring-sky-100">{group.items?.length || 0}</span>
                        </h4>
                        <div className="space-y-1.5">
                          {(group.items || []).map((item) => {
                            const checked = groupSelected || selectedItemIds.has(item.id);
                            return (
                              <label key={item.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${checked ? 'border-sky-100 bg-sky-50 text-sky-800 shadow-xs' : 'border-transparent text-slate-600 hover:border-sky-100 hover:bg-slate-50'} ${groupSelected ? 'cursor-default' : 'cursor-pointer'}`}>
                                <input type="checkbox" checked={checked} disabled={groupSelected} onChange={() => toggleItem(item.id)} className="accent-sky-600 disabled:cursor-not-allowed" />
                                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-sky-600 ring-1 ring-sky-100"><ItemIcon icon={item.icon} className="h-4 w-4" /></span>
                                <span className="min-w-0 truncate">{item.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="border-t border-sky-100 px-3 py-2 text-xs font-medium text-slate-400">{hasTriggers ? `${form.triggerCategoryIds.length} categor${form.triggerCategoryIds.length === 1 ? 'y' : 'ies'}, ${form.triggerGroupIds.length} group(s), ${form.triggerItemIds.length} item(s) selected` : 'No category, group, or item selected - this add-on will be global.'}</p>
          </div>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-600"><input type="checkbox" checked={form.isOptional} onChange={(event) => setForm({ ...form, isOptional: event.target.checked })} className="accent-sky-600" />Optional service</label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-600"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="accent-sky-600" />Active</label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
          <button disabled={busy || !form.appliesToServiceTypes.length} className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save add-on</button>
        </div>
      </form>
    </Modal>
  );
}

function State({ text, action }) { return <div className="rounded-2xl border border-dashed border-sky-200 p-12 text-center text-sm font-medium text-slate-400">{text}{action && <button onClick={action} className="ml-2 font-semibold text-sky-600">Try again</button>}</div>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>{children}</label>; }
