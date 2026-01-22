import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import TableLimitError from './TableLimitError';

// FORÇA DINÂMICO: Garante que o Next.js verifique os cookies em todo acesso
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
    mesaId: string;
  }
}

export default async function MesaLoginPage({ params }: PageProps) {
  const { slug, mesaId } = params;
  const cookieStore = cookies();

  // ============================================================
  // 1. PROTEÇÃO: LOGIN DE FUNCIONÁRIO (GATEKEEPER)
  // ============================================================
  // Verifica se existe o cookie de funcionário ESPECÍFICO desta mesa
  const staffCookie = cookieStore.get(`staff_session_${slug}_${mesaId}`)?.value;

  if (!staffCookie) {
    // Se não estiver logado, manda para o login do funcionário
    const currentPath = `/${slug}/mesa/${mesaId}`;
    redirect(`/${slug}/funcionario/login?mesaId=${mesaId}&callbackUrl=${encodeURIComponent(currentPath)}`);
  }

  // ============================================================
  // 2. VERIFICA SE JÁ EXISTE CLIENTE LOGADO
  // ============================================================
  const sessionNome = cookieStore.get(`comanda_nome_${slug}_${mesaId}`)?.value;

  if (sessionNome) {
    // Se o cliente já está logado, manda direto para o cardápio
    redirect(`/${slug}/mesa/${mesaId}/cardapio`);
  }

  // ============================================================
  // 3. BUSCA DADOS DA EMPRESA E VALIDA LIMITE
  // ============================================================
  const empresa = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresa) {
    return <div className="p-10 text-center">Empresa não encontrada.</div>;
  }

  // Validação de Limite de Mesas
  const numeroMesa = parseInt(mesaId);
  const totalMesas = empresa.totalMesas || 0;

  if (numeroMesa > totalMesas) {
    return <TableLimitError mesaId={mesaId} limit={totalMesas} />;
  }

  // ============================================================
  // 4. RENDERIZA O FORMULÁRIO DE ABERTURA (CLIENTE)
  // ============================================================
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