'use client';

import { useState } from 'react';

export function RelatorioButton() {
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch('/api/relatorio');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErro(body.error ?? 'Erro ao gerar relatório.');
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const cd   = res.headers.get('Content-Disposition') ?? '';
      const match = cd.match(/filename="([^"]+)"/);
      a.href     = url;
      a.download = match ? match[1] : 'relatorio.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setErro('Falha de conexão ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-3 py-1.5 rounded text-xs font-medium bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-200 border border-neutral-700 transition-colors"
      >
        {loading ? 'Gerando PDF…' : '↓ Relatório PDF'}
      </button>
      {erro && <span className="text-xs text-red-400">{erro}</span>}
    </div>
  );
}
