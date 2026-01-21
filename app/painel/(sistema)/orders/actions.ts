'use server'

import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Buscar Pedidos (Separados por Status ou Todos)
// status: 0 = Todos, 1 = Pendentes, etc.
export async function getOrdersAction(statusFilter: number = 0) {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  if (!lojaId) return [];

  const whereClause: any = {
    idu: parseInt(lojaId),
  };

  // Se passou um status específico, filtra. Se for 0, busca os "ativos" (não finalizados/cancelados) para o painel
  if (statusFilter > 0) {
    whereClause.status = statusFilter;
  } else {
    // Busca padrão: Mostra tudo que NÃO está Finalizado (4) nem Cancelado (5)
    // Para a tela de "Acompanhamento em Tempo Real"
    whereClause.status = { in: [1, 2, 3] };
  }

  const pedidos = await prisma.pedido.findMany({
    where: whereClause,
    include: {
      itens: true, // Traz os itens junto
    },
    orderBy: {
      id: 'desc' // Mais novos primeiro
    }
  });

  // Converter Decimal para Number para o Frontend não reclamar
  return pedidos.map(p => ({
    ...p,
    taxa_entrega: Number(p.taxa_entrega),
    subtotal: Number(p.subtotal),
    total: Number(p.total),
    itens: p.itens.map(i => ({
      ...i,
      valor_unit: Number(i.valor_unit),
      total_item: Number(i.total_item)
    }))
  }));
}

// Mudar Status do Pedido (Ex: Aceitar, Finalizar)
export async function updateOrderStatusAction(id: number, newStatus: number) {
  try {
    await prisma.pedido.update({
      where: { id },
      data: { status: newStatus }
    });
    revalidatePath('/painel/orders');
    return { success: true };
  } catch (e) {
    return { error: "Erro ao atualizar pedido." };
  }
}

// --- CRIAR PEDIDO MANUAL (PDV) ---
export async function createOrderAction(formData: FormData) {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  if (!lojaId) return { error: "Sessão inválida." };

  // Dados do Cliente
  const nome = formData.get('nome') as string;
  const celular = formData.get('celular') as string;
  const tipoEntrega = formData.get('tipo_entrega') as string;
  const formaPagamento = formData.get('pagamento') as string;
  const observacao = formData.get('observacao') as string;

  // O "Carrinho" vem como uma string JSON de um input hidden (truque comum)
  const cartJson = formData.get('cart_json') as string;
  const cartItens = JSON.parse(cartJson);

  if (!cartItens || cartItens.length === 0) {
    return { error: "O pedido precisa ter pelo menos um produto." };
  }

  // Calcular totais
  const subtotal = cartItens.reduce((acc: number, item: any) => acc + (item.valor * item.quantidade), 0);
  const taxaEntrega = tipoEntrega === 'DELIVERY' ? 5.00 : 0.00; // Valor fixo para teste, depois pegamos do bairro
  const total = subtotal + taxaEntrega;

  try {
    // Cria o Pedido e os Itens numa tacada só (Transação do Prisma)
    await prisma.pedido.create({
      data: {
        idu: parseInt(lojaId),
        nome_cliente: nome,
        celular_cliente: celular,
        tipo_entrega: tipoEntrega,
        forma_pagamento: formaPagamento,
        subtotal: subtotal,
        taxa_entrega: taxaEntrega,
        total: total,
        status: 1, // 1 = Pendente
        observacao: observacao,
        
        // Criação aninhada dos itens
        itens: {
          create: cartItens.map((item: any) => ({
            nome_produto: item.nome,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valor_unit: item.valor,
            total_item: item.valor * item.quantidade,
            observacao: item.observacao || ""
          }))
        }
      }
    });

    revalidatePath('/painel/orders');
    return { success: true, message: "Pedido criado com sucesso!" };

  } catch (err) {
    console.error(err);
    return { error: "Erro ao criar pedido." };
  }
}

export async function getProductsForSelectAction() {
   const cookieStore = cookies();
   const lojaId = parseInt(cookieStore.get('painel_session')?.value || '0');
   
   const produtos = await prisma.produto.findMany({
      where: { idu: lojaId, status: 1 },
      select: { 
          id: true, 
          nome: true, 
          valor: true,
          // 1. Buscamos 'descricao' e 'valor' do banco de dados
          tamanhos: {
              select: { 
                  id: true, 
                  descricao: true, 
                  valor: true 
              },
              orderBy: { valor: 'asc' }
          }
      }
   });

   // 2. Fazemos a conversão (Mapeamento)
   const produtosSeguros = produtos.map(p => ({
     ...p,
     valor: Number(p.valor),
     
     // AQUI ESTÁ A CORREÇÃO DO UNDEFINED:
     tamanhos: p.tamanhos ? p.tamanhos.map(t => ({
         id: t.id,
         nome: t.descricao,      // <--- A MÁGICA: O banco manda 'descricao', nós transformamos em 'nome'
         preco: Number(t.valor)  // O banco manda 'valor', nós transformamos em 'preco'
     })) : []
   }));

   return produtosSeguros;
}