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

  // 1. Verifica Sessão (Nome E Celular)
  const sessionNome = cookieStore.get(`comanda_nome_${slug}_${mesaId}`)?.value;
  
  // --- CORREÇÃO AQUI: Ler o cookie do celular ---
  const sessionCelular = cookieStore.get(`comanda_celular_${slug}_${mesaId}`)?.value || ''; 

  if (!sessionNome) {
    redirect(`/${slug}/mesa/${mesaId}`);
  }

  // 2. Busca Empresa (Dados Brutos)
  const empresaRaw = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresaRaw) return <div>Empresa não encontrada</div>;

  // 3. Conversão Decimal -> Number
  const empresa = {
    ...empresaRaw,
    dfree: empresaRaw.dfree ? Number(empresaRaw.dfree) : 0,
  };

  // 4. Renderiza o conteúdo passando o Celular
  return (
    <CartContent 
      empresa={empresa} 
      mesaId={mesaId}
      nomeCliente={sessionNome}
      slug={slug}
      celularCliente={sessionCelular} // <--- AQUI ESTAVA FALTANDO ENVIAR
    />
  );
}