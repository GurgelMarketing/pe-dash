import { DropZone } from '@/components/upload/DropZone';

export default function UploadPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-100">Importar Planilha</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Envie o arquivo CSV ou XLSX exportado do sistema IBGE. Cada upload cria um snapshot diário.
        </p>
      </div>
      <DropZone />
    </div>
  );
}
