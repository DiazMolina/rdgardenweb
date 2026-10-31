'use client';

import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Layers, UploadCloud, Loader2, Check } from 'lucide-react';
import { uploadProductImageAction } from '@/app/admin/upload-action';

interface ProductPhotoInputsProps {
  initialMain?: string;
  initialLeaf?: string;
  initialRoots?: string;
  initialExtra?: string;
}

function PhotoCard({
  num,
  name,
  label,
  badgeText,
  badgeColor,
  required = false,
  value,
  onChange,
  hint,
}: {
  num: number;
  name: string;
  label: string;
  badgeText: string;
  badgeColor: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  hint: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadProductImageAction(formData);

      if (res.success && res.url) {
        onChange(res.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2500);
      } else {
        alert(res.error || 'Error al subir la imagen');
      }
    } catch (err: any) {
      console.error('Error subiendo:', err);
      alert('Error de conexión al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]">
            {num}
          </span>
          {label}
        </label>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      {/* Botón de carga directa a Supabase Storage */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          id={`file_input_${name}`}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={15} className="animate-spin text-emerald-700" />
              <span>Subiendo a Supabase Storage...</span>
            </>
          ) : uploadSuccess ? (
            <>
              <Check size={15} className="text-emerald-700" />
              <span>¡Foto subida con éxito!</span>
            </>
          ) : (
            <>
              <UploadCloud size={15} className="text-emerald-700" />
              <span>Subir desde computadora o celular</span>
            </>
          )}
        </button>
      </div>

      {/* Input de URL (autocompletado por el upload o editable manualmente) */}
      <input
        type="url"
        name={name}
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder="https://...supabase.co/... o ingresa URL"
        className="w-full text-xs p-2.5 border border-gray-200 rounded-lg outline-none focus:border-emerald-600 font-mono bg-gray-50/50"
      />

      {value ? (
        <div className="h-36 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center relative group">
          <img src={value} alt={`Vista previa ${label}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-white/90 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold shadow hover:bg-white"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div className="h-24 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs text-center px-4">
          <ImageIcon size={20} className="mb-1 text-gray-300" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
}

export default function ProductPhotoInputs({
  initialMain = '',
  initialLeaf = '',
  initialRoots = '',
  initialExtra = ''
}: ProductPhotoInputsProps) {
  const [mainUrl, setMainUrl] = useState(initialMain);
  const [leafUrl, setLeafUrl] = useState(initialLeaf);
  const [rootsUrl, setRootsUrl] = useState(initialRoots);
  const [extraUrl, setExtraUrl] = useState(initialExtra);

  return (
    <div className="space-y-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Camera size={18} className="text-emerald-700" /> Galería de Fotos (Almacenamiento en Supabase Storage)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Puedes subir fotos directamente desde tu dispositivo o pegar una URL. Las fotos se almacenan de forma segura en tu bucket de Supabase.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FOTO 1 */}
        <PhotoCard
          num={1}
          name="image_url"
          label="Foto Principal: Planta Completa *"
          badgeText="Requerida"
          badgeColor="bg-emerald-100 text-emerald-800"
          required={true}
          value={mainUrl}
          onChange={setMainUrl}
          hint="Sube la foto general de la planta en maceta"
        />

        {/* FOTO 2 */}
        <PhotoCard
          num={2}
          name="image_leaf"
          label="Foto 2: Detalle de Hoja / Follaje"
          badgeText="Foliar"
          badgeColor="bg-blue-100 text-blue-800"
          value={leafUrl}
          onChange={setLeafUrl}
          hint="Primer plano de la variegación o textura de la hoja"
        />

        {/* FOTO 3 */}
        <PhotoCard
          num={3}
          name="image_roots"
          label="Foto 3: Raíces / Cepellón & Sustrato"
          badgeText="Sistema Radicular"
          badgeColor="bg-amber-100 text-amber-800"
          value={rootsUrl}
          onChange={setRootsUrl}
          hint="Demuestra la salud radicular antes del envío"
        />

        {/* FOTO 4 */}
        <PhotoCard
          num={4}
          name="image_extra"
          label="Foto 4: Ambiente / Escala"
          badgeText="Opcional"
          badgeColor="bg-gray-100 text-gray-700"
          value={extraUrl}
          onChange={setExtraUrl}
          hint="Perspectiva de tamaño en sala o maceta de diseño"
        />
      </div>
    </div>
  );
}
