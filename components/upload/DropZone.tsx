'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UploadResult {
  snapshot_id: string;
  total_rows: number;
  errors: string[];
}

export function DropZone() {
  const [dragging,    setDragging]    = useState(false);
  const [file,        setFile]        = useState<File | null>(null);
  const [recordDate,  setRecordDate]  = useState(() => new Date().toISOString().slice(0, 10));
  const [notes,       setNotes]       = useState('');
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [result,      setResult]      = useState<UploadResult | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  const accept = ['.csv', '.xlsx', '.xls'];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }, []);

  function pickFile(f: File) {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Formato não suportado. Use CSV ou XLSX.');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  }

  async function handleUpload() {
    if (!file || !recordDate) return;
    setUploading(true);
    setProgress(10);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('record_date', recordDate);
    if (notes) fd.append('notes', notes);

    setProgress(40);
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: fd });
      setProgress(90);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro no upload.');
      setResult(data as UploadResult);
      setProgress(100);
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Drop area */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${dragging
            ? 'border-blue-500 bg-blue-500/10'
            : file
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-neutral-700 hover:border-neutral-500'}
        `}
      >
        <input
          id="file-input"
          type="file"
          accept={accept.join(',')}
          className="hidden"
          onChange={e => e.target.files?.[0] && pickFile(e.target.files[0])}
        />
        {file ? (
          <div>
            <p className="text-emerald-400 font-medium">{file.name}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB · clique para trocar
            </p>
          </div>
        ) : (
          <div>
            <p className="text-neutral-300">Arraste o arquivo CSV ou XLSX aqui</p>
            <p className="text-xs text-neutral-500 mt-1">ou clique para selecionar</p>
          </div>
        )}
      </div>

      {/* Metadados */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Data de referência dos dados</label>
          <Input
            type="date"
            value={recordDate}
            onChange={e => setRecordDate(e.target.value)}
            className="bg-neutral-900 border-neutral-700 text-neutral-100"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Observações (opcional)</label>
          <Input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Planilha atualizada às 17h"
            className="bg-neutral-900 border-neutral-700 text-neutral-100"
          />
        </div>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="w-full bg-neutral-800 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="bg-emerald-900/40 border border-emerald-700 rounded-lg p-4">
          <p className="text-emerald-400 font-medium">Upload concluído</p>
          <p className="text-sm text-neutral-300 mt-1">
            {result.total_rows} empresas importadas com sucesso.
          </p>
          {result.errors.length > 0 && (
            <p className="text-xs text-yellow-400 mt-2">
              {result.errors.length} lote(s) com erro: {result.errors[0]}
            </p>
          )}
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || !recordDate || uploading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40"
      >
        {uploading ? 'Enviando...' : 'Importar Planilha'}
      </Button>
    </div>
  );
}
