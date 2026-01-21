import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import TableLimitError from './TableLimitError'; // <--- Importe o novo componente

interface PageProps {
  params: {
    slug: string;
    mesaId: string;
  }
}

export default async function MesaLoginPage({ params }: PageProps) {
  const { slug, mesaId } = params;

  // 1. Busca a empresa
  const empresa = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresa) {
    return <div className="p-10 text-center">Empresa não encontrada.</div>;
  }

  // 2. Validação de Limite de Mesas
  const numeroMesa = parseInt(mesaId);
  const totalMesas = empresa.totalMesas || 0;

  if (numeroMesa > totalMesas) {
    // AQUI MUDOU: Usamos o componente Client Side separado
    return <TableLimitError mesaId={mesaId} limit={totalMesas} />;
  }

  // 3. Verifica se já existe sessão
  const cookieStore = cookies();
  const sessionNome = cookieStore.get(`comanda_nome_${slug}_${mesaId}`)?.value;

  if (sessionNome) {
    redirect(`/${slug}/mesa/${mesaId}/cardapio`);
  }

  // 4. Renderiza o Login
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4" style={{ backgroundColor: empresa.corfundo || '#f0f0f0' }}>
      
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <LoginForm 
          slug={slug} 
          mesaId={mesaId} 
          color={empresa.cormenu || '#000'} 
          nomeEmpresa={empresa.nomeempresa}
        />
      </div>

      <div className="mt-8 text-gray-400 text-sm">
        <i className="fa fa-lock"></i> Ambiente Seguro
      </div>
    </div>
  );
}