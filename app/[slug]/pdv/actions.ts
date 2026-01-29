'use server'

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- HELPER: BUSCA ID DA EMPRESA PELO SLUG (URL) ---
async function getEmpresaPorSlug(slug: string) {
  if (!slug) return null;
  
  const empresa = await prisma.config.findUnique({
    where: { url: slug }
  });

  if (!empresa) throw new Error("Empresa não encontrada");
  return empresa.id;
}

// --- 1. BUSCAR PEDIDOS ATIVOS (ATUALIZADO) ---
export async function getPedidosPDV(slug: string) {
  const idu = await getEmpresaPorSlug(slug);

  if (!idu) return [];

  const pedidos = await prisma.pedido.findMany({
    where: {
      idu: idu,
      // ATUALIZAÇÃO AQUI: Adicionado status 9 (Conta Solicitada)
      status: { in: [1, 2, 3, 9] }, 
      // 1=Novo, 2=Preparo, 3=Entrega, 9=Conta Solicitada
    },
    orderBy: { id: 'desc' },
    include: {
        itens: true 
    }
  });

  // CONVERSÃO DE DECIMAL PARA NUMBER (CORREÇÃO DE SERIALIZAÇÃO)
  return pedidos.map(p => {
    return {
        ...p,
        // Convertendo Decimals do Pedido
        taxa_entrega: Number(p.taxa_entrega),
        subtotal: Number(p.subtotal),
        total: Number(p.total),
        
        // Convertendo Decimals dos Itens
        itens: p.itens.map(item => ({
            ...item,
            valor_unit: Number(item.valor_unit),
            total_item: Number(item.total_item)
        })),

        // Campos formatados
        data_formatada: new Date(p.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        total_formatado: Number(p.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        troco_msg: p.troco_para ? `Troco p/ ${p.troco_para}` : 'Não precisa',
        origem: p.mesa ? `Mesa ${p.mesa}` : (p.tipo_entrega === 'DELIVERY' ? 'Delivery' : 'Balcão')
    };
  });
}

// --- 2. ATUALIZAR STATUS ---
export async function atualizarStatusPedido(slug: string, pedidoId: number, novoStatus: number) {
  try {
    await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: novoStatus }
    });
    
    // Atualiza a tela do PDV específico dessa loja
    revalidatePath(`/${slug}/pdv`);
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar pedido." };
  }
}

// --- 3. FINALIZAR PEDIDO (PAGAMENTO) ---
export async function finalizarPedidoCompleto(
  slug: string,
  pedidoId: number, 
  formaPagamento: string, 
  trocoPara: number | null
) {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId }
    });

    if (!pedido) return { error: "Pedido não encontrado." };

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        status: 4, // Finalizado
        forma_pagamento: formaPagamento,
        troco_para: trocoPara ? String(trocoPara) : null
      }
    });
    
    revalidatePath(`/${slug}/pdv`);
    return { success: true };

  } catch (error) {
    console.error(error);
    return { error: "Erro ao finalizar pedido." };
  }
}

// --- 4. BUSCAR CARDÁPIO (CATEGORIAS E PRODUTOS) ---
export async function getDadosCardapio(slug: string) {
  const idu = await getEmpresaPorSlug(slug);

  if (!idu) return [];

  const categorias = await prisma.categoria.findMany({
    where: { idu: idu },
    orderBy: { posicao: 'asc' },
    include: {
      produtos: {
        where: { status: 1 }, // Apenas ativos
        orderBy: { nome: 'asc' }
      }
    }
  });

  // CONVERSÃO DECIMAL -> NUMBER NOS PRODUTOS
  return categorias.map(cat => ({
    ...cat,
    produtos: cat.produtos.map(prod => ({
        ...prod,
        valor: Number(prod.valor) 
    }))
  }));
}

// --- 5. SALVAR NOVO PEDIDO (BALCÃO) ---
export async function salvarPedidoBalcao(slug: string, dados: any) {
  try {
    const idu = await getEmpresaPorSlug(slug);

    if (!idu) return { error: "Empresa inválida" };
    
    let totalCalculado = 0;
    
    const itensParaSalvar = dados.itens.map((item: any) => {
      const totalItem = Number(item.valor) * Number(item.quantidade);
      totalCalculado += totalItem;
      
      return {
        nome_produto: item.nome,
        quantidade: Number(item.quantidade),
        valor_unit: Number(item.valor),
        total_item: totalItem,
        observacao: item.observacao || ''
      };
    });

    await prisma.pedido.create({
      data: {
        idu: idu,
        nome_cliente: dados.nome_cliente || 'Cliente Balcão',
        celular_cliente: dados.celular || '', 
        tipo_entrega: 'BALCAO', 
        forma_pagamento: dados.forma_pagamento,
        troco_para: dados.troco ? String(dados.troco) : null,
        subtotal: totalCalculado,
        total: totalCalculado,
        status: 2, // Entra como 'Em Preparo'
        itens: {
          create: itensParaSalvar
        }
      }
    });

    revalidatePath(`/${slug}/pdv`);
    return { success: true };

  } catch (error) {
    console.error(error);
    return { error: "Erro ao lançar pedido." };
  }
}