import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CartContent from './CartContent'; 

interface PageProps {
  params: {
    slug: string;
    mesaId: string;
  }
}

export default async function CartPage({ params }: PageProps) {
  const { slug, mesaId } = params;
  const cookieStore = cookies();

  // ============================================================
  // 1. PROTEÇÃO: LOGIN DE FUNCIONÁRIO (GATEKEEPER)
  // ============================================================
  // Verifica se existe o cookie de funcionário ESPECÍFICO desta mesa
  const staffCookie = cookieStore.get(`staff_session_${slug}_${mesaId}`)?.value;

  // Se não tiver o login dessa mesa, manda para a tela de login
  if (!staffCookie) {
    const currentPath = `/${slug}/mesa/${mesaId}/carrinho`;
    redirect(`/${slug}/funcionario/login?mesaId=${mesaId}&callbackUrl=${encodeURIComponent(currentPath)}`);
  }

  // ============================================================
  // 2. VERIFICA SESSÃO DO CLIENTE (COMANDA)
  // ============================================================
  const sessionNome = cookieStore.get(`comanda_nome_${slug}_${mesaId}`)?.value;
  // Busca o celular, se não existir assume vazio ''
  const sessionCelular = cookieStore.get(`comanda_celular_${slug}_${mesaId}`)?.value || ''; 

  // Se não tiver nome de cliente (comanda não aberta), volta para abrir mesa
  if (!sessionNome) {
    redirect(`/${slug}/mesa/${mesaId}`);
  }

  // ============================================================
  // 3. DADOS DA EMPRESA
  // ============================================================
  const empresaRaw = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresaRaw) return <div>Empresa não encontrada</div>;

  // Conversão Decimal -> Number para evitar erros no React
  const empresa = {
    ...empresaRaw,
    dfree: empresaRaw.dfree ? Number(empresaRaw.dfree) : 0,
  };

  return (
    <CartContent 
      empresa={empresa} 
      mesaId={mesaId}
      nomeCliente={sessionNome}
      slug={slug}
      celularCliente={sessionCelular}
    />
  );
}