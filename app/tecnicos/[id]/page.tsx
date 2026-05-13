import { TecnicoClient } from './TecnicoClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TecnicoPage({ params }: Props) {
  const { id } = await params;
  const nome = decodeURIComponent(id);
  return <TecnicoClient nome={nome} />;
}
