import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MenuContent from './MenuContent';

interface PageProps {
  params: {
    slug: string;
    mesaId: string;
  }
}

export default async function CardapioPage({ params }: PageProps) {
  const { slug, mesaId } = params;

  // 1. VERIFICA SESSÃO
  const cookieStore = cookies();
  const sessionNome = cookieStore.get(`comanda_nome_${slug}_${mesaId}`)?.value;
  const sessionCelular = cookieStore.get(`comanda_celular_${slug}_${mesaId}`)?.value || '';
  
  if (!sessionNome) {
    redirect(`/${slug}/mesa/${mesaId}`);
  }

  // 2. BUSCA EMPRESA (RAW = Dados Brutos)
  const empresaRaw = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresaRaw) return <div>Empresa não encontrada</div>;

  // --- CORREÇÃO DO DECIMAL AQUI ---
  // Criamos um novo objeto convertendo o dfree para Number
  const empresa = {
    ...empresaRaw,
    dfree: empresaRaw.dfree ? Number(empresaRaw.dfree) : 0, 
    // Se tiver outros campos decimais na config (ex: taxa mínima), faça o mesmo aqui
  };

  const hoje = new Date().getDay().toString(); 

  // 3. BUSCA CATEGORIAS
  const categorias = await prisma.categoria.findMany({
    where: { idu: empresa.id },
    orderBy: { posicao: 'asc' }
  });

  // 4. BUSCA PRODUTOS
  const produtosRaw = await prisma.produto.findMany({
    where: {
      idu: empresa.id,
      status: 1, 
      OR: [
        { visivel: 'G' },      
        { visivel: { contains: hoje } } // Ajuste dos dias que fizemos antes
      ]
    },
    orderBy: { nome: 'asc' }
  });

  // --- CORREÇÃO DO DECIMAL E TIPO (PRODUTOS) ---
  const produtosFormatados = produtosRaw.map(p => ({
    ...p,
    valor: Number(p.valor), // Converte Decimal -> Number
    categoria: p.categoriaId
  }));

  return (
    <MenuContent 
      empresa={empresa} 
      categorias={categorias} 
      produtos={produtosFormatados}
      mesaId={mesaId}
      nomeCliente={sessionNome}
      celularCliente={sessionCelular}
    />
  );
}