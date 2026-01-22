import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MenuContent from './MenuContent';

// --- CORREÇÃO: FORÇA O NEXT.JS A NÃO FAZER CACHE DESTA PÁGINA ---
// Isso obriga o servidor a verificar o cookie em TODO acesso.
export const dynamic = 'force-dynamic'; 

interface PageProps {
  params: {
    slug: string;
    mesaId: string;
  }
}

export default async function CardapioPage({ params }: PageProps) {
  const { slug, mesaId } = params;
  const cookieStore = cookies();

  // DEBUG: Vamos ver no terminal o que está acontecendo
  const cookieName = `staff_session_${slug}_${mesaId}`;
  const staffCookie = cookieStore.get(cookieName)?.value;

  console.log(`[CARDAPIO] Acessando Mesa ${mesaId}. Cookie procurado: ${cookieName}`);
  console.log(`[CARDAPIO] Valor encontrado: ${staffCookie ? 'LOGADO' : 'NÃO LOGADO'}`);

  // ============================================================
  // 1. PROTEÇÃO: LOGIN DE FUNCIONÁRIO (GATEKEEPER)
  // ============================================================
  if (!staffCookie) {
    console.log(`[CARDAPIO] Redirecionando para login...`);
    const currentPath = `/${slug}/mesa/${mesaId}/cardapio`;
    // Passamos o mesaId na URL para o login saber qual cookie criar
    redirect(`/${slug}/funcionario/login?mesaId=${mesaId}&callbackUrl=${encodeURIComponent(currentPath)}`);
  }

  // Opcional: Verificar se o cargo tem permissão
  const staff = JSON.parse(staffCookie);
  
  // Regra: Apenas estes cargos podem acessar o cardápio
  if (!['GERENTE', 'ATENDIMENTO', 'CAIXA'].includes(staff.funcao)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#721c24', background: '#f8d7da' }}>
        <h3>Acesso Negado</h3>
        <p>Seu cargo atual (<strong>{staff.funcao}</strong>) não tem permissão para acessar o cardápio.</p>
      </div>
    );
  }

  // ============================================================
  // 2. VERIFICA SESSÃO DO CLIENTE (COMANDA ABERTA)
  // ============================================================
  const sessionNome = cookieStore.get(`comanda_nome_${slug}_${mesaId}`)?.value;
  const sessionCelular = cookieStore.get(`comanda_celular_${slug}_${mesaId}`)?.value || '';
  
  if (!sessionNome) {
    redirect(`/${slug}/mesa/${mesaId}`);
  }

  // ============================================================
  // 3. BUSCA DADOS DO SISTEMA
  // ============================================================
  const empresaRaw = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresaRaw) return <div>Empresa não encontrada</div>;

  const empresa = {
    ...empresaRaw,
    dfree: empresaRaw.dfree ? Number(empresaRaw.dfree) : 0, 
  };

  const hoje = new Date().getDay().toString(); 

  const categorias = await prisma.categoria.findMany({
    where: { idu: empresa.id },
    orderBy: { posicao: 'asc' }
  });

  const produtosRaw = await prisma.produto.findMany({
    where: {
      idu: empresa.id,
      status: 1, 
      OR: [
        { visivel: 'G' },      
        { visivel: { contains: hoje } }
      ]
    },
    orderBy: { nome: 'asc' }
  });

  const produtosFormatados = produtosRaw.map(p => ({
    ...p,
    valor: Number(p.valor),
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