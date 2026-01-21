// app/[slug]/mesa/[mesaId]/carrinho/actions.ts
'use server'

import { prisma } from '@/src/lib/prisma';
import { revalidatePath } from 'next/cache';

interface FinalizarPedidoParams {
  slug: string;
  mesaId: string;
  nomeCliente: string;
  celular?: string;
  itens: any[];
  subtotal: number;
  totalGeral: number;
  pessoas?: number;
}

export async function finalizarPedidoAction(dados: FinalizarPedidoParams) {
  try {
    // 1. Busca a empresa
    const empresa = await prisma.config.findUnique({ 
        where: { url: dados.slug } 
    });

    if (!empresa) return { success: false, error: "Empresa inválida" };

    // 2. Verifica se JÁ EXISTE um pedido aberto (Status 1, 2 ou 3)
    let pedido = await prisma.pedido.findFirst({
      where: {
        idu: empresa.id,
        mesa: dados.mesaId,
        status: { in: [1, 2, 3] }
      }
    });

    // 3. Lógica de Criação ou Atualização
    if (!pedido) {
      // --- CENÁRIO A: PRIMEIRO PEDIDO (Cria do zero) ---
      pedido = await prisma.pedido.create({
        data: {
          idu: empresa.id, // O IDU fica apenas aqui, no cabeçalho do pedido
          nome_cliente: dados.nomeCliente,
          celular_cliente: dados.celular || '',
          mesa: dados.mesaId,
          tipo_entrega: "MESA",
          status: 1,
          subtotal: dados.subtotal,
          total: dados.totalGeral,
          pessoas: dados.pessoas || 1,
          forma_pagamento: "EM ABERTO",
          
          itens: {
            create: dados.itens.map((item: any) => ({
              produtoId: item.product.id,
              nome_produto: item.product.nome,
              quantidade: item.quantity,
              valor_unit: item.product.valor,
              total_item: item.total,
              observacao: item.obs || ''
              // SEM 'idu' AQUI
              // SEM 'status' AQUI
            }))
          }
        }
      });
    } else {
      // --- CENÁRIO B: ADICIONAR MAIS ITENS (Pedido já existe) ---
      
      await prisma.pedidoItem.createMany({
        data: dados.itens.map((item: any) => ({
          pedidoId: pedido!.id,         // Vincula ao pedido existente
          produtoId: item.product.id,   // Vincula ao produto
          
          // REMOVIDO: idu: empresa.id, <-- O erro estava aqui
          
          nome_produto: item.product.nome,
          quantidade: item.quantity,
          valor_unit: item.product.valor,
          total_item: item.total,
          observacao: item.obs || ''
          // SEM 'status' AQUI
        }))
      });

      // Atualiza os totais do pedido pai
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
          subtotal: { increment: dados.subtotal },
          total: { increment: dados.totalGeral }
        }
      });
    }

    // 4. Atualiza o painel do gerente
    revalidatePath('/painel/orders');
    revalidatePath('/painel/tables');

    return { success: true, pedidoId: pedido.id };

  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    return { success: false, error: "Erro ao salvar: " + (error as Error).message };
  }
}