import { prisma } from '../../../../src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CompanyForm from './CompanyForm';

export default async function CompanyPage() {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  
  if (!lojaId) redirect('/painel/login');

  const config = await prisma.config.findUnique({
    where: { id: parseInt(lojaId) }
  });

  if (!config) return <div>Erro: Configuração não encontrada.</div>;

  // --- CORREÇÃO AQUI ---
  // Criamos um novo objeto convertendo o Decimal para Number ou String
  const dadosParaOFormulario = {
    ...config,
    dfree: config.dfree ? Number(config.dfree) : 0, // Converte Decimal para Number
  };
  // ---------------------

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="/painel/dashboard">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">Empresa</li>
        </ol>
        <h6 className="slim-pagetitle">Dados da Empresa</h6>
      </div>

      {/* Passamos o objeto convertido ao invés do original */}
      <CompanyForm data={dadosParaOFormulario} />
    </>
  );
}