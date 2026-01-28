'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/src/lib/prisma';

// --- 1. ABRIR MESA (LOGIN) ---
export async function abrirMesaAction(formData: FormData) {
  const nome = formData.get('nome') as string;
  const celular = formData.get('celular') as string;
  const slug = formData.get('slug') as string;
  const mesaId = formData.get('mesaId') as string;

  // Debug: Verifique no terminal do VS Code se o celular está chegando aqui
  console.log(`[LOGIN] Abrindo mesa ${mesaId} para: ${nome}, Celular: ${celular}`);

  const empresa = await prisma.config.findUnique({ where: { url: slug } });
  
  if (!empresa) {
    return { error: "Empresa não encontrada" };
  }

  const cookieStore = cookies();
  
  // 1. Grava Cookie do Nome
  cookieStore.set(`comanda_nome_${slug}_${mesaId}`, nome, {
    maxAge: 60 * 60 * 12, // 12 horas
    path: '/',
  });

  // 2. Grava Cookie do Celular (SEMPRE que tiver valor)
  if (celular && celular.trim() !== '') {
    cookieStore.set(`comanda_celular_${slug}_${mesaId}`, celular, {
      maxAge: 60 * 60 * 12,
      path: '/',
    });
  }

  // 3. Redireciona
  redirect(`/${slug}/mesa/${mesaId}/cardapio`);
}

// --- 2. ENCERRAR SESSÃO (LOGOUT) ---
export async function encerrarSessaoAction(slug: string, mesaId: string) {
  const cookieStore = cookies();
  
  // Nomes dos cookies
  const cookieNome = `comanda_nome_${slug}_${mesaId}`;
  const cookieCelular = `comanda_celular_${slug}_${mesaId}`; // <--- FALTAVA ISSO
  
  const empresa = await prisma.config.findUnique({ where: { url: slug } });

  if (empresa) {
    // Marca pedidos pendentes como finalizados para liberar a mesa (opcional, manter se for sua regra)
    await prisma.pedido.updateMany({
      where: {
        idu: empresa.id,
        mesa: mesaId,
        status: { in: [1, 2, 3] }
      },
      data: { status: 4 }
    });
  }

  // DELETA AMBOS OS COOKIES PARA LIMPAR A SESSÃO DE VEZ
  cookieStore.delete(cookieNome);
  cookieStore.delete(cookieCelular);

  redirect(`/${slug}/mesa/${mesaId}`);
}

// --- 3. BUSCAR HISTÓRICO (FILTRO CORRIGIDO) ---
export async function buscarHistoricoPedidos(
  slug: string, 
  mesaId: string, 
  nomeCliente: string, 
  celularCliente: string
) {
  try {
    const empresa = await prisma.config.findUnique({ where: { url: slug } });
    if (!empresa) return [];

    console.log(`[HISTORICO] Buscando para ${nomeCliente}. Celular: [${celularCliente}]`);

    // --- CORREÇÃO AQUI ---
    // Removemos 'celular_cliente' desta lista inicial.
    // Deixamos apenas o que é OBRIGATÓRIO para todos (Loja, Mesa, Nome e Status).
    const whereClause: any = {
        idu: empresa.id,
        mesa: mesaId,
        nome_cliente: nomeCliente,
        // celular_cliente: celularCliente, <--- ESTA LINHA FOI REMOVIDA
        status: { in: [1, 2, 3, 4] }
    };

    // Agora o IF abaixo controla totalmente a lógica do celular:
    // "Ou é igual ao meu celular, OU é vazio (pedido antigo)"
    if (celularCliente && celularCliente.trim() !== '') {
        whereClause.OR = [
            { celular_cliente: celularCliente },
            { celular_cliente: '' }
        ];
    }

    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
      include: {
        itens: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const pedidosFormatados = pedidos.map((pedido) => ({
      ...pedido,
      taxa_entrega: Number(pedido.taxa_entrega),
      subtotal: Number(pedido.subtotal),
      total: Number(pedido.total),
      itens: pedido.itens.map((item) => ({
        ...item,
        valor_unit: Number(item.valor_unit),
        total_item: Number(item.total_item)
      }))
    }));

    return pedidosFormatados;

  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
}

export async function solicitarFechamentoMesa(slug: string, mesaId: string, nome: string, celular: string) {
  try {
    // 1. Define o intervalo do dia (Hoje)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Busca todos os pedidos ATIVOS (não cancelados) desta mesa/cliente HOJE
    const pedidos = await prisma.pedido.findMany({
      where: {
        mesa: mesaId,
        // Se quiser filtrar estritamente pelo cliente atual (segurança):
        celular: celular, 
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 5 } // Ignora pedidos cancelados (assumindo status 5 = cancelado)
      }
    });

    if (!pedidos || pedidos.length === 0) {
      return { error: "Nenhum consumo encontrado para esta mesa hoje." };
    }

    // 3. Calcula o total da conta
    const totalConta = pedidos.reduce((acc, pedido) => acc + Number(pedido.total), 0);

    // 4. SIMULAÇÃO DO ENVIO AO PDV
    // Aqui você conectaria com seu sistema de impressão ou websocket
    console.log(`[PDV] SOLICITAÇÃO DE FECHAMENTO:`);
    console.log(`>> Mesa: ${mesaId}`);
    console.log(`>> Cliente: ${nome} (${celular})`);
    console.log(`>> Total a Pagar: R$ ${totalConta.toFixed(2)}`);

    // DICA: Você pode criar um registro na tabela 'Notificacoes' ou mudar o status da mesa aqui
    
    return { 
      success: true, 
      total: totalConta,
      message: `Conta solicitada com sucesso! Valor total: R$ ${totalConta.toFixed(2).replace('.', ',')}. Aguarde o garçom.` 
    };

  } catch (error) {
    console.error("Erro ao fechar mesa:", error);
    return { error: "Erro ao processar solicitação. Chame o garçom." };
  }
}