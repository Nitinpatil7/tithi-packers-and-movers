'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function IconPreview({ icon, className = 'h-12 w-12' }) {
  return icon ? (
    <Image
      src={icon}
      alt=""
      width={64}
      height={64}
      className={`${className} rounded-lg object-cover dark:drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)]`}
    />
  ) : (
    <span className={className} />
  );
}

export default function IconInput({ value, onChange, uploadIcon, label = 'Icon image' }) {
  const [uploadError, setUploadError] = useState('');
  const [editingUrl, setEditingUrl] = useState(!value);

  useEffect(() => {
    setEditingUrl(!value);
  }, [value]);

  const uploadFile = async (file) => {
    setUploadError('');
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setUploadError('Icon must be a PNG or JPEG image.');
      return;
    }
    if (file.size > 500 * 1024) {
      setUploadError('Icon image must be 500 KB or smaller.');
      return;
    }
    try {
      const uploaded = await uploadIcon.mutateAsync(file);
      onChange(uploaded.icon || '');
      setEditingUrl(false);
      toast.success('Icon uploaded');
    } catch (error) {
      setUploadError(error.message || 'Icon upload failed. Please try again.');
    }
  };

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    await uploadFile(file);
  };

  const pasteIcon = async (event) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.kind === 'file' && ['image/png', 'image/jpeg'].includes(item.type));
    const imageFile = imageItem?.getAsFile();
    if (imageFile) {
      event.preventDefault();
      await uploadFile(imageFile);
      return;
    }

    const text = event.clipboardData?.getData('text/plain')?.trim();
    if (text && /^https?:\/\//i.test(text)) {
      event.preventDefault();
      setUploadError('');
      onChange(text);
      setEditingUrl(false);
    }
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <div onPaste={pasteIcon} tabIndex={0} className="rounded-lg bg-sky-50/30 p-3 outline-none transition focus:ring-2 focus:ring-sky-200 dark:bg-white/5 dark:shadow-[0_14px_28px_rgba(0,0,0,0.18)]">
        {value && !editingUrl ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <IconPreview icon={value} className="h-14 w-14" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Icon selected</span>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setEditingUrl(true)} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-200">Edit URL</button>
              <button type="button" onClick={() => { setUploadError(''); onChange(''); setEditingUrl(true); }} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-500 shadow-sm dark:bg-slate-900">Remove</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={value || ''} onChange={(event) => { setUploadError(''); onChange(event.target.value); }} className="admin-field bg-white pl-12" placeholder="Paste image URL here, or paste an image" />
            </div>
            <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-sky-700 shadow-sm hover:bg-sky-50 dark:bg-slate-900 dark:text-sky-200 ${uploadIcon.isPending ? 'pointer-events-none opacity-60' : ''}`}>
              <ImageIcon className="h-4 w-4" />
              {uploadIcon.isPending ? 'Uploading...' : 'Choose file'}
              <input type="file" accept="image/png,image/jpeg" onChange={chooseFile} className="sr-only" disabled={uploadIcon.isPending} />
            </label>
          </div>
        )}
        {uploadIcon.isPending && <p className="mt-2 text-xs font-bold text-sky-600">Uploading icon...</p>}
        {uploadError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{uploadError}</p>}
      </div>
    </label>
  );
}
