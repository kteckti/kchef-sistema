'use server'

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper de Empresa
async function getEmpresaPorSlug(slug: string) {
  if (!slug) return null;
  const empresa = await prisma.config.findUnique({ where: { url: slug } });
  if (!empresa) throw new Error("Empresa não encontrada");
  return empresa.id;
}

// 1. BUSCAR PEDIDOS EM PREPARO (Status 2)
export async function getPedidosCozinha(slug: string) {
  const idu = await getEmpresaPorSlug(slug);
  if (!idu) return [];

  const pedidos = await prisma.pedido.findMany({
    where: {
      idu: idu,
      status: 2, // APENAS EM PREPARO
    },
    orderBy: { createdAt: 'asc' }, // Os mais antigos aparecem primeiro (fila)
    include: { itens: true }
  });

  return pedidos.map(p => ({
    ...p,
    // Conversões de Decimal para evitar erro no React
    taxa_entrega: Number(p.taxa_entrega),
    subtotal: Number(p.subtotal),
    total: Number(p.total),
    itens: p.itens.map(item => ({
        ...item,
        valor_unit: Number(item.valor_unit),
        total_item: Number(item.total_item)
    })),
    // Formatações visuais
    hora_pedido: new Date(p.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    tempo_decorrido: Math.floor((new Date().getTime() - new Date(p.createdAt).getTime()) / 60000), // Minutos
    origem: p.mesa ? `Mesa ${p.mesa}` : (p.tipo_entrega === 'DELIVERY' ? 'Delivery' : 'Balcão')
  }));
}

// 2. MARCAR COMO PRONTO (Muda para Status 3)
export async function marcarComoPronto(slug: string, pedidoId: number) {
  try {
    await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: 3 } // Vai para Entrega/Caixa
    });
    revalidatePath(`/${slug}/cozinha`);
    revalidatePath(`/${slug}/pdv`); // Atualiza o PDV também
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar." };
  }
}