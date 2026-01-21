'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';

export async function abrirMesaAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const celular = formData.get('celular') as string; // Opcional
  const slug = formData.get('slug') as string;
  const mesaId = formData.get('mesaId') as string;

  // 1. Apenas valida se a empresa existe
  const empresa = await prisma.config.findUnique({ where: { url: slug } });
  
  if (!empresa) {
    return { error: "Empresa não encontrada" }; // Ou redirecionar para erro
  }

  // --- REMOVIDA A CRIAÇÃO DE PEDIDO AQUI ---
  // O pedido será criado apenas quando o cliente enviar o carrinho.
  
  // 2. Grava a Sessão (Cookies)
  const cookieStore = cookies();
  
  // Cookie de Identificação
  cookieStore.set(`comanda_nome_${slug}_${mesaId}`, nome, {
    maxAge: 60 * 60 * 12, // 12 horas
    path: '/',
  });

  // (Opcional) Cookie de Celular
  if (celular) {
    cookieStore.set(`comanda_celular_${slug}_${mesaId}`, celular, {
      maxAge: 60 * 60 * 12,
      path: '/',
    });
  }

  // 3. Redireciona para o cardápio
  redirect(`/${slug}/mesa/${mesaId}/cardapio`);
}

export async function encerrarSessaoAction(slug: string, mesaId: string) {
  const cookieStore = cookies();
  const cookieName = `comanda_nome_${slug}_${mesaId}`;
  
  // 1. Busca a empresa para pegar o ID
  const empresa = await prisma.config.findUnique({ where: { url: slug } });

  if (empresa) {
    // 2. Marca o pedido dessa mesa como finalizado (Status 4) para liberar no painel
    await prisma.pedido.updateMany({
      where: {
        idu: empresa.id,
        mesa: mesaId,
        status: { in: [1, 2, 3] }
      },
      data: { status: 4 }
    });
  }

  // 3. Remove o cookie
  cookieStore.delete(cookieName);

  // 4. Redireciona para a tela de login da mesa
  redirect(`/${slug}/mesa/${mesaId}`);
}

export async function buscarHistoricoPedidos(slug: string, mesaId: string) {
  try {
    const empresa = await prisma.config.findUnique({ where: { url: slug } });
    if (!empresa) return [];

    const pedidos = await prisma.pedido.findMany({
      where: {
        idu: empresa.id,
        mesa: mesaId,
        // Trazemos status 1, 2, 3 (ativos) e 4 (finalizado/histórico recente)
        status: { in: [1, 2, 3, 4] } 
      },
      include: {
        itens: true // Traz os itens da tabela 'pedidos_itens'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return pedidos;
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
}