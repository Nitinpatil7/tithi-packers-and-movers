'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Building2, Edit3, Eye, EyeOff, Globe2, ImageIcon, KeyRound, MapPin, Plus, Save, Settings, ShieldCheck, Trash2, Truck, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@ui/Modal';
import { changeAdminPassword } from '@/lib/adminAuth';
import { useSiteSetting, useUpdateSiteSetting, useUploadSiteLogo } from '@hooks/useSiteSetting';
import { useBranches, useCreateBranch, useDeleteBranch, useUpdateBranch } from '@hooks/useBranches';
import { resolveSiteAssetUrl } from '@utils/siteAssets';

const emptySite = { companyName: '', tagline: '', aboutTitle: '', aboutDescription: '', phone: '', whatsappNumber: '', ownerWhatsappNumber: '', email: '', address: '', logoUrl: '', socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '', twitter: '' }, stats: { yearsExperience: 0, successfulMoves: 0, citiesCovered: 0, customerSatisfaction: 0 }, serviceLabels: { local_shifting: 'Local Shifting', intercity_moving: 'Intercity Moving', porter_labour_service: 'Labour & Vehicle' } };
const emptyBranch = { branchName: '', city: '', state: '', address: '', phone: '', email: '', coordinates: { lat: '', lng: '' }, isMainBranch: false, isActive: true, sortOrder: 0 };

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('site');
  const { data: siteData, isLoading: siteLoading } = useSiteSetting();
  const siteMutation = useUpdateSiteSetting();
  const logoMutation = useUploadSiteLogo();
  const [site, setSite] = useState(emptySite);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const { data: branches = [], isLoading: branchesLoading, isError, refetch } = useBranches();
  const createBranchMutation = useCreateBranch(); const updateBranchMutation = useUpdateBranch(); const deleteBranchMutation = useDeleteBranch();
  const [branchOpen, setBranchOpen] = useState(false); const [editingBranch, setEditingBranch] = useState(null); const [branch, setBranch] = useState(emptyBranch);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' }); const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!siteData) return;
    setSite({
      companyName: siteData.companyName || '', tagline: siteData.tagline || '', aboutTitle: siteData.aboutTitle || '', aboutDescription: siteData.aboutDescription || '',
      phone: siteData.phone || '', whatsappNumber: siteData.whatsappNumber || '', ownerWhatsappNumber: siteData.ownerWhatsappNumber || '', email: siteData.email || '', address: siteData.address || '', logoUrl: siteData.logoUrl || '',
      socialLinks: { ...emptySite.socialLinks, ...siteData.socialLinks }, stats: { ...emptySite.stats, ...siteData.stats }, serviceLabels: { ...emptySite.serviceLabels, ...siteData.serviceLabels },
    });
  }, [siteData]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview('');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(logoFile);
    setLogoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [logoFile]);

  const changeSite = (key, value) => setSite((current) => ({ ...current, [key]: value }));
  const changeNested = (group, key, value) => setSite((current) => ({ ...current, [group]: { ...current[group], [key]: value } }));
  const selectLogo = (file) => {
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) return toast.error('Logo must be PNG, JPG, SVG, or WebP');
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo image must be 2 MB or smaller');
    setLogoFile(file);
  };
  const saveSite = async (event) => {
    event.preventDefault();
    try {
      let payload = site;
      if (logoFile) {
        const uploaded = await logoMutation.mutateAsync(logoFile);
        payload = { ...site, logoUrl: uploaded.logoUrl || '' };
        setSite(payload);
        setLogoFile(null);
      }
      await siteMutation.mutateAsync(payload);
      toast.success('Site settings updated');
    } catch (error) {
      toast.error(error.message);
    }
  };
  const openBranch = (item = null) => { setEditingBranch(item); setBranch(item ? { ...emptyBranch, ...item, coordinates: { ...emptyBranch.coordinates, ...item.coordinates } } : emptyBranch); setBranchOpen(true); };
  const saveBranch = async (event) => { event.preventDefault(); const payload = { ...branch, sortOrder: Number(branch.sortOrder) || 0, coordinates: { lat: branch.coordinates.lat === '' ? undefined : Number(branch.coordinates.lat), lng: branch.coordinates.lng === '' ? undefined : Number(branch.coordinates.lng) } }; if (payload.coordinates.lat === undefined && payload.coordinates.lng === undefined) delete payload.coordinates; try { if (editingBranch) await updateBranchMutation.mutateAsync({ id: editingBranch._id, data: payload }); else await createBranchMutation.mutateAsync(payload); toast.success(editingBranch ? 'Branch updated' : 'Branch created'); setBranchOpen(false); } catch (error) { toast.error(error.message); } };
  const deactivateBranch = async (item) => { if (!window.confirm(`Deactivate ${item.branchName}?`)) return; try { await deleteBranchMutation.mutateAsync(item._id); toast.success('Branch deactivated'); } catch (error) { toast.error(error.message); } };
  const changePassword = async (event) => { event.preventDefault(); if (passwords.newPassword.length < 12) return toast.error('New password must be at least 12 characters'); if (passwords.newPassword !== passwords.confirmPassword) return toast.error('New passwords do not match'); setPasswordLoading(true); try { await changeAdminPassword(passwords.currentPassword, passwords.newPassword); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); toast.success('Password changed successfully'); } catch (error) { toast.error(error.message); } finally { setPasswordLoading(false); } };

  return <div className="space-y-6 text-left"><header><p className="text-xs font-bold uppercase tracking-[.18em] text-sky-600">Business configuration</p><h1 className="mt-1 text-2xl font-black text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage public business information, branches and account security.</p></header>
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-sky-100 bg-white p-2">{[['site','Site Settings',Globe2],['branches','Branches',Building2],['security','Change Password',KeyRound]].map(([key,label,Icon]) => <button key={key} onClick={() => setTab(key)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === key ? 'bg-sky-600 text-white shadow-md shadow-sky-100' : 'text-slate-500 hover:bg-sky-50 hover:text-sky-700'}`}><Icon className="h-4 w-4" />{label}</button>)}</nav>

    {tab === 'site' && <form onSubmit={saveSite} className="space-y-5">{siteLoading ? <Loading /> : <><Panel title="Company information" icon={Settings}><div className="grid gap-4 sm:grid-cols-2"><Field label="Company name"><input className="admin-field" value={site.companyName} onChange={(e) => changeSite('companyName', e.target.value)} /></Field><Field label="Tagline"><input className="admin-field" value={site.tagline} onChange={(e) => changeSite('tagline', e.target.value)} /></Field><Field label="Phone"><input className="admin-field" value={site.phone} onChange={(e) => changeSite('phone', e.target.value)} /></Field><Field label="Public WhatsApp number"><input className="admin-field" value={site.whatsappNumber} onChange={(e) => changeSite('whatsappNumber', e.target.value)} /></Field><Field label="Owner WhatsApp number"><input className="admin-field" value={site.ownerWhatsappNumber} onChange={(e) => changeSite('ownerWhatsappNumber', e.target.value)} /></Field><Field label="Email"><input type="email" className="admin-field" value={site.email} onChange={(e) => changeSite('email', e.target.value)} /></Field><div className="sm:col-span-2"><LogoUpload currentUrl={site.logoUrl} previewUrl={logoPreview} fileName={logoFile?.name} onSelect={selectLogo} /></div></div><Field label="Address"><textarea rows={3} className="admin-field" value={site.address} onChange={(e) => changeSite('address', e.target.value)} /></Field></Panel>
      <Panel title="About content" icon={ShieldCheck}><div className="space-y-4"><Field label="About title"><input className="admin-field" value={site.aboutTitle} onChange={(e) => changeSite('aboutTitle', e.target.value)} /></Field><Field label="About description"><textarea rows={5} className="admin-field" value={site.aboutDescription} onChange={(e) => changeSite('aboutDescription', e.target.value)} /></Field></div></Panel>
      <Panel title="Website service names" icon={Truck}><div className="grid gap-4 sm:grid-cols-3"><Field label="Local shifting name"><input className="admin-field" value={site.serviceLabels.local_shifting} onChange={(e) => changeNested('serviceLabels', 'local_shifting', e.target.value)} /></Field><Field label="Intercity moving name"><input className="admin-field" value={site.serviceLabels.intercity_moving} onChange={(e) => changeNested('serviceLabels', 'intercity_moving', e.target.value)} /></Field><Field label="Labour & Vehicle name"><input className="admin-field" value={site.serviceLabels.porter_labour_service} onChange={(e) => changeNested('serviceLabels', 'porter_labour_service', e.target.value)} /></Field></div></Panel>
      <Panel title="Social links" icon={Globe2}><div className="grid gap-4 sm:grid-cols-2">{Object.keys(emptySite.socialLinks).map((key) => <Field key={key} label={key}><input className="admin-field" value={site.socialLinks[key]} onChange={(e) => changeNested('socialLinks', key, e.target.value)} placeholder={`https://${key}.com/...`} /></Field>)}</div></Panel>
      <Panel title="Public statistics" icon={Save}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.keys(emptySite.stats).map((key) => <Field key={key} label={key.replace(/([A-Z])/g, ' $1')}><input type="number" min="0" className="admin-field" value={site.stats[key]} onChange={(e) => changeNested('stats', key, Number(e.target.value))} /></Field>)}</div></Panel>
      <div className="sticky bottom-3 flex justify-end"><button disabled={siteMutation.isPending || logoMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 disabled:opacity-60"><Save className="h-4 w-4" /> {logoMutation.isPending ? 'Uploading logo...' : 'Save site settings'}</button></div></>}</form>}

    {tab === 'branches' && <section className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black text-slate-900">Branch directory</h2><p className="text-sm text-slate-500">Supports any number of current and future locations.</p></div><button onClick={() => openBranch()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add branch</button></div>{branchesLoading ? <Loading /> : isError ? <button onClick={() => refetch()} className="text-sm font-bold text-sky-600">Could not load branches. Try again</button> : branches.length === 0 ? <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-10 text-center text-sm text-slate-500">No branches added yet.</div> : <div className="grid gap-4 lg:grid-cols-2">{branches.map((item) => <article key={item._id} className="rounded-2xl border border-sky-100 bg-white p-5"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-sky-100 text-sky-600"><Building2 className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">{item.branchName}</h3>{item.isMainBranch && <Badge>Main</Badge>}<Badge inactive={item.isActive === false}>{item.isActive === false ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{item.isActive === false ? 'Inactive' : 'Active'}</Badge></div><p className="mt-1 text-sm text-slate-500">{item.city}{item.state ? `, ${item.state}` : ''}</p></div></div><p className="mt-4 flex gap-2 text-sm leading-6 text-slate-600"><MapPin className="mt-1 h-4 w-4 shrink-0 text-sky-600" />{item.address}</p><div className="mt-3 grid gap-1 text-xs text-slate-400 sm:grid-cols-2"><span>{item.phone || 'No phone'}</span><span>{item.email || 'No email'}</span></div><div className="mt-4 flex justify-end gap-2 border-t border-sky-50 pt-4"><button onClick={() => openBranch(item)} className="inline-flex items-center gap-2 rounded-xl border border-sky-100 px-3 py-2 text-xs font-bold text-sky-700"><Edit3 className="h-3.5 w-3.5" /> Edit</button><button onClick={() => deactivateBranch(item)} disabled={item.isActive === false} className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-500 disabled:opacity-35"><Trash2 className="h-3.5 w-3.5" /> Deactivate</button></div></article>)}</div>}</section>}

    {tab === 'security' && <Panel title="Change admin password" icon={KeyRound}><form onSubmit={changePassword} className="space-y-4"><Field label="Current password"><input className="admin-field" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="New password"><input className="admin-field" type="password" minLength={12} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required /></Field><Field label="Confirm new password"><input className="admin-field" type="password" minLength={12} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required /></Field></div><div className="flex justify-end"><button disabled={passwordLoading} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><KeyRound className="h-4 w-4" /> Update password</button></div></form></Panel>}

    <Modal isOpen={branchOpen} onClose={() => setBranchOpen(false)} title={editingBranch ? 'Update branch' : 'Add branch'} size="lg"><form onSubmit={saveBranch} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Branch name *"><input required className="admin-field" value={branch.branchName} onChange={(e) => setBranch({ ...branch, branchName: e.target.value })} /></Field><Field label="City *"><input required className="admin-field" value={branch.city} onChange={(e) => setBranch({ ...branch, city: e.target.value })} /></Field><Field label="State"><input className="admin-field" value={branch.state} onChange={(e) => setBranch({ ...branch, state: e.target.value })} /></Field><Field label="Phone"><input className="admin-field" value={branch.phone} onChange={(e) => setBranch({ ...branch, phone: e.target.value })} /></Field><Field label="Email"><input type="email" className="admin-field" value={branch.email} onChange={(e) => setBranch({ ...branch, email: e.target.value })} /></Field><Field label="Sort order"><input type="number" min="0" className="admin-field" value={branch.sortOrder} onChange={(e) => setBranch({ ...branch, sortOrder: e.target.value })} /></Field></div><Field label="Address *"><textarea required rows={3} className="admin-field" value={branch.address} onChange={(e) => setBranch({ ...branch, address: e.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Latitude"><input type="number" step="any" className="admin-field" value={branch.coordinates.lat} onChange={(e) => setBranch({ ...branch, coordinates: { ...branch.coordinates, lat: e.target.value } })} /></Field><Field label="Longitude"><input type="number" step="any" className="admin-field" value={branch.coordinates.lng} onChange={(e) => setBranch({ ...branch, coordinates: { ...branch.coordinates, lng: e.target.value } })} /></Field></div><div className="flex flex-wrap gap-5"><Check checked={branch.isMainBranch} onChange={(value) => setBranch({ ...branch, isMainBranch: value })} label="Main branch" /><Check checked={branch.isActive} onChange={(value) => setBranch({ ...branch, isActive: value })} label="Active" /></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setBranchOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancel</button><button disabled={createBranchMutation.isPending || updateBranchMutation.isPending} className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white">{editingBranch ? 'Save changes' : 'Create branch'}</button></div></form></Modal>
  </div>;
}

function LogoUpload({ currentUrl, previewUrl, fileName, onSelect }) {
  const imageUrl = previewUrl || resolveSiteAssetUrl(currentUrl);
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Logo image</span>
      <div className="grid gap-4 rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-4 sm:grid-cols-[220px_1fr] sm:items-center">
        <div className="flex h-28 items-center justify-center rounded-xl border border-sky-100 bg-white p-4">
          {imageUrl ? (
            <Image unoptimized src={imageUrl} alt="Selected company logo" width={190} height={70} className="max-h-20 w-auto max-w-full object-contain" />
          ) : (
            <ImageIcon className="h-10 w-10 text-sky-300" />
          )}
        </div>
        <div className="space-y-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-sky-100 transition hover:bg-sky-700">
            <Upload className="h-4 w-4" />
            Select image from file
            <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="sr-only" onChange={(event) => onSelect(event.target.files?.[0])} />
          </label>
          <p className="text-xs font-semibold text-slate-500">PNG, JPG, SVG, or WebP. Max size 2 MB. The file is uploaded when you save settings.</p>
          {fileName && <p className="truncate text-xs font-bold text-sky-700">Selected: {fileName}</p>}
        </div>
      </div>
    </div>
  );
}
function Panel({ title, icon: Icon, children }) { return <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-5 flex items-center gap-2 border-b border-sky-100 pb-3 text-sm font-bold uppercase tracking-wider text-slate-900"><Icon className="h-4 w-4 text-sky-600" />{title}</h2>{children}</section>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>; }
function Badge({ children, inactive }) { return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${inactive ? 'bg-slate-100 text-slate-500' : 'bg-sky-50 text-sky-700'}`}>{children}</span>; }
function Check({ checked, onChange, label }) { return <label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-sky-600" />{label}</label>; }
function Loading() { return <div className="h-40 animate-pulse rounded-2xl border border-sky-100 bg-white" />; }
