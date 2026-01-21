import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';
import ClientDetailForm from './ClientDetailForm';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  // 1. Busca os dados brutos (Raw)
  const clienteRaw = await prisma.config.findUnique({
    where: { id: id }
  });

  if (!clienteRaw) {
    return <div className="pd-20">Empresa não encontrada.</div>;
  }

  // 2. CONVERSÃO: Transforma o Decimal em Number
  // O '...' copia tudo, e depois sobrescrevemos o dfree
  const cliente = {
    ...clienteRaw,
    dfree: clienteRaw.dfree ? Number(clienteRaw.dfree) : 0,
  };

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><Link href="/admin/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Detalhes da Empresa</li>
        </ol>
        <h6 className="slim-pagetitle">{cliente.nomeempresa}</h6>
      </div>

      {/* Agora passamos o objeto 'cliente' já convertido */}
      <ClientDetailForm cliente={cliente} />
    </>
  );
}