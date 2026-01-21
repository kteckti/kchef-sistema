import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CartContent from './CartContent'; // Seu componente cliente (nome pode variar)

interface PageProps {
  params: {
    slug: string;
    mesaId: string;
  }
}

export default async function CartPage({ params }: PageProps) {
  const { slug, mesaId } = params;

  // 1. Verifica Sessão
  const cookieStore = cookies();
  const sessionNome = cookieStore.get(`comanda_nome_${slug}_${mesaId}`)?.value;

  if (!sessionNome) {
    redirect(`/${slug}/mesa/${mesaId}`);
  }

  // 2. Busca Empresa (Dados Brutos)
  const empresaRaw = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresaRaw) return <div>Empresa não encontrada</div>;

  // 3. CONVERSÃO OBRIGATÓRIA (Decimal -> Number)
  // O Next.js não envia 'Decimal' para o navegador, então convertemos aqui:
  const empresa = {
    ...empresaRaw,
    dfree: empresaRaw.dfree ? Number(empresaRaw.dfree) : 0,
    // Se tiver outros campos decimais na tabela config, converta-os aqui também
  };

  // 4. Renderiza o conteúdo do carrinho passando os dados "limpos"
  return (
    <CartContent 
      empresa={empresa} 
      mesaId={mesaId}
      nomeCliente={sessionNome}
      slug={slug}
    />
  );
}